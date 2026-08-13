import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// amount is expressed in cents
const BodySchema = z.object({
  amount: z.number().int().positive().max(10_000_000),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "no auth" }, 401);

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: uErr } = await supabaseAuth.auth.getUser(token);
    if (uErr || !userData.user) return json({ error: "unauth" }, 401);
    const user = userData.user;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Montant invalide" }, 400);
    const amount = parsed.data.amount;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: connect } = await admin
      .from("connect_accounts")
      .select("stripe_account_id, payouts_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!connect?.stripe_account_id || !connect.payouts_enabled) {
      return json({ error: "Compte de paiement non actif" }, 400);
    }

    // --- Server-side balance computation (cents) ---
    const { data: payments } = await admin
      .from("payments")
      .select("net_amount, status")
      .eq("payee_id", user.id)
      .eq("status", "completed");

    const earnedFromPayments = (payments ?? []).reduce(
      (s, p) => s + Number(p.net_amount ?? 0),
      0
    );

    const { data: collabs } = await admin
      .from("collabs")
      .select("amount, commission, status")
      .eq("creator_id", user.id)
      .eq("status", "released");

    const earnedFromCollabs = (collabs ?? []).reduce(
      (s, c) => s + Math.round((Number(c.amount) - Number(c.commission)) * 100),
      0
    );

    const { data: withdrawals } = await admin
      .from("withdrawals")
      .select("amount, status")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "completed"]);

    const alreadyOut = (withdrawals ?? []).reduce((s, w) => s + Number(w.amount ?? 0), 0);

    const available = earnedFromPayments + earnedFromCollabs - alreadyOut;
    if (amount > available) {
      return json({ error: "Montant supérieur au solde disponible", available }, 400);
    }

    const { data: withdrawal, error: wErr } = await admin
      .from("withdrawals")
      .insert({ user_id: user.id, amount, status: "processing" })
      .select()
      .single();
    if (wErr || !withdrawal) return json({ error: "Impossible de créer le retrait" }, 500);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    try {
      const transfer = await stripe.transfers.create({
        amount,
        currency: "eur",
        destination: connect.stripe_account_id,
        metadata: { withdrawal_id: withdrawal.id, user_id: user.id },
      });

      await admin
        .from("withdrawals")
        .update({ stripe_transfer_id: transfer.id })
        .eq("id", withdrawal.id);

      // Push the funds to the creator's bank account
      let payoutId: string | null = null;
      try {
        const payout = await stripe.payouts.create(
          {
            amount,
            currency: "eur",
            metadata: { withdrawal_id: withdrawal.id },
          },
          { stripeAccount: connect.stripe_account_id }
        );
        payoutId = payout.id;
      } catch (pe) {
        // Automatic payout schedule will handle it – keep the withdrawal as processing
        console.log("payout deferred", pe instanceof Error ? pe.message : pe);
      }

      if (payoutId) {
        await admin
          .from("withdrawals")
          .update({ stripe_payout_id: payoutId })
          .eq("id", withdrawal.id);
      }

      return json({ ok: true, withdrawal_id: withdrawal.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      console.error("transfer failed", msg);
      await admin
        .from("withdrawals")
        .update({ status: "failed", failure_reason: msg })
        .eq("id", withdrawal.id);
      return json({ error: msg }, 500);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("request-payout", msg);
    return json({ error: msg }, 500);
  }
});
