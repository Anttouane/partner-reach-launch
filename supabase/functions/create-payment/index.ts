import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const { amount, payee_id, description, conversation_id } = await req.json();

    if (!amount || !payee_id) {
      throw new Error("Amount and payee_id are required");
    }

    // Get commission rate from settings
    const { data: settings } = await supabaseClient
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "commission_rate")
      .single();

    const commissionRate = settings ? parseFloat(settings.setting_value) : 10;
    const amountInCents = Math.round(amount * 100);
    const commissionAmount = Math.round(amountInCents * (commissionRate / 100));
    const netAmount = amountInCents - commissionAmount;

    console.log(`Creating payment: amount=${amountInCents}, commission=${commissionAmount}, net=${netAmount}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      metadata: {
        payer_id: userData.user.id,
        payee_id: payee_id,
        commission_amount: commissionAmount.toString(),
        net_amount: netAmount.toString(),
        conversation_id: conversation_id || "",
      },
    });

    // Create admin client for inserting payment record
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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
        conversation_id: conversation_id,
        description: description,
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      throw new Error("Failed to create payment record");
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
        status: 400,
      }
    );
  }
});
