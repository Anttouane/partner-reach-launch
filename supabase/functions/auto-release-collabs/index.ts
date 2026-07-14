import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Scheduled cron job – captures collabs delivered more than 7 days ago
// without dispute, releasing the escrow to Partnery / creator automatically.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const nowIso = new Date().toISOString();

  const { data: eligible, error } = await admin
    .from("collabs")
    .select("id, stripe_payment_intent")
    .eq("status", "delivered")
    .lte("auto_release_at", nowIso)
    .not("stripe_payment_intent", "is", null);

  if (error) {
    console.error("auto-release query failed", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  const results: Array<{ id: string; ok: boolean; err?: string }> = [];

  for (const c of eligible ?? []) {
    // Skip if a dispute is still open
    const { data: openDispute } = await admin
      .from("disputes")
      .select("id")
      .eq("collab_id", c.id)
      .neq("status", "resolved")
      .maybeSingle();

    if (openDispute) {
      results.push({ id: c.id, ok: false, err: "open dispute" });
      continue;
    }

    try {
      const pi = await stripe.paymentIntents.capture(c.stripe_payment_intent!);
      const chargeId = (pi.latest_charge as string) || null;
      await admin
        .from("collabs")
        .update({ status: "released", stripe_charge_id: chargeId })
        .eq("id", c.id);
      results.push({ id: c.id, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      console.error("auto-release fail", c.id, msg);
      results.push({ id: c.id, ok: false, err: msg });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
