import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Euro, Loader2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payeeId: string;
  payeeName: string;
  conversationId?: string;
}

export function PaymentDialog({ open, onOpenChange, payeeId, payeeName, conversationId }: PaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [commissionRate] = useState(10); // 10% commission

  const commissionAmount = amount ? (parseFloat(amount) * commissionRate / 100).toFixed(2) : "0.00";
  const netAmount = amount ? (parseFloat(amount) - parseFloat(commissionAmount)).toFixed(2) : "0.00";

  const handlePayment = async () => {
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

      // For now, show success - in production you'd integrate Stripe Elements
      toast({
        title: "Paiement initié",
        description: `Un paiement de ${amount}€ a été créé. Le destinataire recevra ${netAmount}€.`,
      });
      
      onOpenChange(false);
      setAmount("");
      setDescription("");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <span className="text-destructive">-{commissionAmount} €</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">{payeeName} recevra</span>
                <span className="font-bold text-primary">{netAmount} €</span>
              </div>
            </div>
          )}

          <Button 
            onClick={handlePayment} 
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Payer {amount ? `${amount} €` : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
