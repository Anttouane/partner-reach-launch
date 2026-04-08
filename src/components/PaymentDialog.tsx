import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Euro, Loader2, CheckCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51SZuuCPFrJ7yM5bTgly9IHTkjq9AO89q1eiW7yAvgLpVjpR5UPUOhkJei0VAYtK3sT81ZtTGbyqOszbdMJkNP68S00nAa15Zx7");

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payeeId: string;
  payeeName: string;
  conversationId?: string;
}

interface PaymentFormProps {
  clientSecret: string;
  payeeName: string;
  amount: string;
  netAmount: string;
  onSuccess: () => void;
}

function PaymentForm({ clientSecret, payeeName, amount, netAmount, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Montant total</span>
          <span className="font-medium">{parseFloat(amount).toFixed(2)} €</span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-medium">{payeeName} recevra</span>
          <span className="font-bold text-primary">{netAmount} €</span>
        </div>
      </div>

      <PaymentElement />

      <Button type="submit" disabled={!stripe || processing} className="w-full">
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Payer {amount} €
          </>
        )}
      </Button>
    </form>
  );
}

export function PaymentDialog({ open, onOpenChange, payeeId, payeeName, conversationId }: PaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [netAmount, setNetAmount] = useState("0.00");
  const [commissionAmount, setCommissionAmount] = useState("0.00");
  const [commissionRate, setCommissionRate] = useState(5);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleCreatePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: parseFloat(amount),
          payee_id: payeeId,
          description,
          conversation_id: conversationId,
        },
      });

      if (error) throw error;

      setClientSecret(data.clientSecret);
      setNetAmount((data.netAmount / 100).toFixed(2));
      setCommissionAmount((data.commissionAmount / 100).toFixed(2));
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setPaymentSuccess(true);
    toast({
      title: "Paiement réussi !",
      description: `${payeeName} recevra ${netAmount} €.`,
    });
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setAmount("");
      setDescription("");
      setClientSecret(null);
      setNetAmount("0.00");
      setCommissionAmount("0.00");
      setPaymentSuccess(false);
    }
    onOpenChange(open);
  };

  // Calculate preview commission
  const previewCommission = amount ? (parseFloat(amount) * commissionRate / 100).toFixed(2) : "0.00";
  const previewNet = amount ? (parseFloat(amount) - parseFloat(previewCommission)).toFixed(2) : "0.00";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Envoyer un paiement
          </DialogTitle>
          <DialogDescription>
            Payer {payeeName} de manière sécurisée via Stripe
          </DialogDescription>
        </DialogHeader>

        {paymentSuccess ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Paiement confirmé !</h3>
            <p className="text-muted-foreground">
              {payeeName} recevra {netAmount} € après commission.
            </p>
            <Button onClick={() => handleClose(false)} className="w-full">
              Fermer
            </Button>
          </div>
        ) : clientSecret ? (
          <div className="pt-4">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: "stripe" },
                locale: "fr",
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                payeeName={payeeName}
                amount={amount}
                netAmount={netAmount}
                onSuccess={handleSuccess}
              />
            </Elements>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Ex: Paiement pour collaboration Instagram"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant total</span>
                  <span className="font-medium">{parseFloat(amount).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission plateforme ({commissionRate}%)</span>
                  <span className="text-destructive">-{previewCommission} €</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium">{payeeName} recevra</span>
                  <span className="font-bold text-primary">{previewNet} €</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreatePayment}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création du paiement...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Continuer vers le paiement {amount ? `de ${amount} €` : ""}
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
