import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({ collab_id: z.string().uuid() });

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

    const { data: collab } = await admin
      .from("collabs")
      .select("id, status, stripe_payment_intent, amount, campaigns(brand_id, name)")
      .eq("id", parsed.data.collab_id)
      .maybeSingle();

    if (!collab) return json({ error: "not found" }, 404);
    if ((collab as any).campaigns.brand_id !== userData.user.id)
      return json({ error: "forbidden" }, 403);
    if (collab.status !== "delivered")
      return json({ error: "not deliverable" }, 400);
    if (!collab.stripe_payment_intent)
      return json({ error: "no payment intent" }, 400);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Capture the previously authorized amount to release the escrow to Partnery.
    const pi = await stripe.paymentIntents.capture(collab.stripe_payment_intent);
    const chargeId = (pi.latest_charge as string) || null;

    await admin
      .from("collabs")
      .update({ status: "released", stripe_charge_id: chargeId })
      .eq("id", collab.id);

    return json({ ok: true, charge_id: chargeId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("release-collab-payment", msg);
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
