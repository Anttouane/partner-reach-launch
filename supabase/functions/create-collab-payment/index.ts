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
    if (!authHeader) return new Response(JSON.stringify({ error: "no auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData.user) return new Response(JSON.stringify({ error: "unauth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return new Response(JSON.stringify({ error: "invalid" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { data: collab } = await admin
      .from("collabs")
      .select("id, amount, status, campaign_id, campaigns(brand_id, name)")
      .eq("id", parsed.data.collab_id)
      .maybeSingle();
    if (!collab) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if ((collab as any).campaigns.brand_id !== userData.user.id) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (collab.status !== "awaiting_payment") return new Response(JSON.stringify({ error: "already paid" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const amountCents = Math.round(Number(collab.amount) * 100);

    const origin = req.headers.get("origin") || "";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_intent_data: {
        capture_method: "manual", // hold funds
        metadata: { collab_id: collab.id },
      },
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `Collaboration – ${(collab as any).campaigns.name}` },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      customer_email: userData.user.email,
      success_url: `${origin}/collab/${collab.id}?paid=1`,
      cancel_url: `${origin}/collab/${collab.id}`,
      metadata: { collab_id: collab.id },
    });

    // Mark escrowed optimistically once session is created; final confirmation via webhook (existing).
    await admin.from("collabs").update({
      stripe_payment_intent: session.payment_intent as string | null,
      status: "escrowed",
    }).eq("id", collab.id);

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
