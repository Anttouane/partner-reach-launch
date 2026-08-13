import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  action: z.enum(["start", "refresh"]).default("start"),
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

    let raw: unknown = {};
    try { raw = await req.json(); } catch { raw = {}; }
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) return json({ error: "invalid" }, 400);
    const { action } = parsed.data;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { data: existing } = await admin
      .from("connect_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    let accountId = existing?.stripe_account_id as string | undefined;

    if (!accountId) {
      if (action === "refresh") return json({ account: null });
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: user.email ?? undefined,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: { user_id: user.id },
      });
      accountId = account.id;
      await admin.from("connect_accounts").insert({
        user_id: user.id,
        stripe_account_id: accountId,
      });
    }

    // Always refresh the stored status from Stripe
    const account = await stripe.accounts.retrieve(accountId);
    const requirementsDue = [
      ...(account.requirements?.currently_due ?? []),
      ...(account.requirements?.past_due ?? []),
    ].join(", ") || null;

    await admin
      .from("connect_accounts")
      .update({
        charges_enabled: account.charges_enabled ?? false,
        payouts_enabled: account.payouts_enabled ?? false,
        details_submitted: account.details_submitted ?? false,
        requirements_due: requirementsDue,
      })
      .eq("user_id", user.id);

    const status = {
      stripe_account_id: accountId,
      charges_enabled: account.charges_enabled ?? false,
      payouts_enabled: account.payouts_enabled ?? false,
      details_submitted: account.details_submitted ?? false,
      requirements_due: requirementsDue,
    };

    if (action === "refresh") return json({ account: status });

    const origin = req.headers.get("origin") || "";
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/wallet?connect=refresh`,
      return_url: `${origin}/wallet?connect=done`,
      type: "account_onboarding",
    });

    return json({ url: link.url, account: status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("connect-onboarding", msg);
    return json({ error: msg }, 500);
  }
});
