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
  amount: z.number().positive().max(100000),
  payee_id: z.string().uuid(),
  description: z.string().max(500).optional().default(""),
  conversation_id: z.string().uuid().optional().nullable(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.json();
    const parsed = BodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount, payee_id, description, conversation_id } = parsed.data;

    // Prevent self-payment
    if (userData.user.id === payee_id) {
      return new Response(JSON.stringify({ error: "Cannot pay yourself" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user-specific commission rate first, fallback to global
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: userCommission } = await supabaseAdmin
      .from("user_commissions")
      .select("commission_rate")
      .eq("user_id", payee_id)
      .maybeSingle();

    let commissionRate = 5;
    if (userCommission) {
      commissionRate = parseFloat(userCommission.commission_rate);
    } else {
      const { data: settings } = await supabaseAdmin
        .from("platform_settings")
        .select("setting_value")
        .eq("setting_key", "commission_rate")
        .single();
      if (settings) {
        commissionRate = parseFloat(settings.setting_value);
      }
    }

    const amountInCents = Math.round(amount * 100);
    const commissionAmount = Math.round(amountInCents * (commissionRate / 100));
    const netAmount = amountInCents - commissionAmount;

    console.log(`Creating payment: amount=${amountInCents}, commission=${commissionAmount}, net=${netAmount}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        payer_id: userData.user.id,
        payee_id: payee_id,
        commission_amount: commissionAmount.toString(),
        net_amount: netAmount.toString(),
        conversation_id: conversation_id || "",
      },
    });

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        payer_id: userData.user.id,
        payee_id: payee_id,
        amount: amountInCents,
        commission_amount: commissionAmount,
        commission_rate: commissionRate,
        net_amount: netAmount,
        stripe_payment_intent_id: paymentIntent.id,
        conversation_id: conversation_id || null,
        description: description || null,
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      return new Response(JSON.stringify({ error: "Failed to create payment record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Payment record created: ${payment.id}`);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
        amount: amountInCents,
        commissionAmount,
        netAmount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating payment:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
