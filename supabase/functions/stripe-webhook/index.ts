import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret || !signature) {
      console.error("Missing webhook secret or signature");
      return new Response(JSON.stringify({ error: "Missing webhook secret or signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errMessage);
    return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  console.log(`Processing webhook event: ${event.type}`);

  const setCollabStatus = async (collabId: string, patch: Record<string, unknown>) => {
    const { error } = await supabaseAdmin.from("collabs").update(patch).eq("id", collabId);
    if (error) console.error("collab update failed", collabId, error.message);
  };

  const collabIdFromPI = (pi: Stripe.PaymentIntent) =>
    (pi.metadata?.collab_id as string | undefined) || undefined;

  try {
    switch (event.type) {
      // ---------- Collab escrow: funds authorized (manual capture) ----------
      case "payment_intent.amount_capturable_updated": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const collabId = collabIdFromPI(pi);
        if (collabId) {
          await setCollabStatus(collabId, {
            status: "escrowed",
            stripe_payment_intent: pi.id,
          });
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const collabId = session.metadata?.collab_id;
        if (collabId && session.payment_intent) {
          const piId = typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id;
          const pi = await stripe.paymentIntents.retrieve(piId);
          const escrowed = pi.status === "requires_capture" || pi.status === "succeeded";
          await setCollabStatus(collabId, {
            stripe_payment_intent: piId,
            ...(escrowed ? { status: pi.status === "succeeded" ? "released" : "escrowed" } : {}),
          });
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const collabId = session.metadata?.collab_id;
        if (collabId) {
          const { data: collab } = await supabaseAdmin
            .from("collabs")
            .select("status")
            .eq("id", collabId)
            .maybeSingle();
          if (collab && collab.status === "awaiting_payment") {
            await setCollabStatus(collabId, { stripe_payment_intent: null });
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);

        const collabId = collabIdFromPI(paymentIntent);
        if (collabId) {
          const chargeId = typeof paymentIntent.latest_charge === "string"
            ? paymentIntent.latest_charge
            : paymentIntent.latest_charge?.id ?? null;
          await setCollabStatus(collabId, { status: "released", stripe_charge_id: chargeId });
          break;
        }

        const { error } = await supabaseAdmin
          .from("payments")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) console.error("Error updating payment status:", error);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);

        const collabId = collabIdFromPI(paymentIntent);
        if (collabId) {
          await setCollabStatus(collabId, { status: "awaiting_payment" });
          break;
        }

        const { error } = await supabaseAdmin
          .from("payments")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) console.error("Error updating payment status:", error);
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment canceled: ${paymentIntent.id}`);

        const collabId = collabIdFromPI(paymentIntent);
        if (collabId) {
          await setCollabStatus(collabId, {
            status: "awaiting_payment",
            stripe_payment_intent: null,
          });
          break;
        }

        const { error } = await supabaseAdmin
          .from("payments")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (error) console.error("Error updating payment status:", error);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (piId) {
          const { data: collab } = await supabaseAdmin
            .from("collabs")
            .select("id")
            .eq("stripe_payment_intent", piId)
            .maybeSingle();
          if (collab) await setCollabStatus(collab.id, { status: "refunded" });
        }
        break;
      }

      // ---------- Creator payouts ----------
      case "payout.paid": {
        const payout = event.data.object as Stripe.Payout;
        const withdrawalId = payout.metadata?.withdrawal_id;
        const query = supabaseAdmin
          .from("withdrawals")
          .update({ status: "completed", processed_at: new Date().toISOString() });
        const { error } = withdrawalId
          ? await query.eq("id", withdrawalId)
          : await query.eq("stripe_payout_id", payout.id);
        if (error) console.error("payout.paid update failed", error.message);
        break;
      }

      case "payout.failed": {
        const payout = event.data.object as Stripe.Payout;
        const withdrawalId = payout.metadata?.withdrawal_id;
        const patch = {
          status: "failed",
          failure_reason: payout.failure_message ?? payout.failure_code ?? "payout failed",
        };
        const query = supabaseAdmin.from("withdrawals").update(patch);
        const { error } = withdrawalId
          ? await query.eq("id", withdrawalId)
          : await query.eq("stripe_payout_id", payout.id);
        if (error) console.error("payout.failed update failed", error.message);
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const requirementsDue = [
          ...(account.requirements?.currently_due ?? []),
          ...(account.requirements?.past_due ?? []),
        ].join(", ") || null;
        const { error } = await supabaseAdmin
          .from("connect_accounts")
          .update({
            charges_enabled: account.charges_enabled ?? false,
            payouts_enabled: account.payouts_enabled ?? false,
            details_submitted: account.details_submitted ?? false,
            requirements_due: requirementsDue,
          })
          .eq("stripe_account_id", account.id);
        if (error) console.error("account.updated failed", error.message);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
