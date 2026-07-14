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
  collab_id: z.string().uuid(),
  reason: z.string().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "no auth" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: uErr } = await supabaseAuth.auth.getUser(token);
    if (uErr || !userData.user) return json({ error: "unauth" }, 401);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "invalid" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Only admins or the brand can trigger a refund.
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    const { data: collab } = await admin
      .from("collabs")
      .select("id, status, stripe_payment_intent, campaigns(brand_id)")
      .eq("id", parsed.data.collab_id)
      .maybeSingle();

    if (!collab) return json({ error: "not found" }, 404);
    const isBrand = (collab as any).campaigns.brand_id === userData.user.id;
    if (!isAdmin && !isBrand) return json({ error: "forbidden" }, 403);

    if (!collab.stripe_payment_intent) return json({ error: "no payment" }, 400);
    if (!["escrowed", "delivered", "disputed"].includes(collab.status))
      return json({ error: "not refundable" }, 400);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const pi = await stripe.paymentIntents.retrieve(collab.stripe_payment_intent);

    if (pi.status === "requires_capture") {
      // Funds authorized but not captured -> cancel authorization = full release.
      await stripe.paymentIntents.cancel(collab.stripe_payment_intent);
    } else if (pi.status === "succeeded") {
      // Already captured -> issue refund.
      await stripe.refunds.create({
        payment_intent: collab.stripe_payment_intent,
        reason: "requested_by_customer",
      });
    }

    await admin
      .from("collabs")
      .update({ status: "refunded" })
      .eq("id", collab.id);

    return json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("refund-collab-payment", msg);
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
