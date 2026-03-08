import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Contract } from '@/types/contract';
import { Separator } from '@/components/ui/separator';

interface ContractFinancialSectionProps {
  contract: Contract;
  isLocked: boolean;
  onUpdate: (updates: Partial<Contract>) => void;
}

export function ContractFinancialSection({ contract, isLocked, onUpdate }: ContractFinancialSectionProps) {
  const [totalAmount, setTotalAmount] = useState(contract.total_amount / 100);
  const [paymentTerms, setPaymentTerms] = useState(contract.payment_terms || '');

  const commissionRate = contract.platform_commission_rate;
  const commissionAmount = Math.round(totalAmount * 100 * (commissionRate / 100));
  const stripeFeeEstimate = Math.round(totalAmount * 100 * 0.015 + 25); // 1.5% + 0.25€
  const creatorNet = Math.round(totalAmount * 100 - commissionAmount - stripeFeeEstimate);

  useEffect(() => {
    const handler = setTimeout(() => {
      onUpdate({
        total_amount: Math.round(totalAmount * 100),
        platform_commission_amount: commissionAmount,
        stripe_fee_estimate: stripeFeeEstimate,
        creator_net_amount: creatorNet,
        payment_terms: paymentTerms || null,
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [totalAmount, paymentTerms]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="total_amount">Montant total (€)</Label>
          <Input
            id="total_amount"
            type="number"
            min="0"
            step="0.01"
            value={totalAmount}
            onChange={e => setTotalAmount(parseFloat(e.target.value) || 0)}
            disabled={isLocked}
          />
        </div>
        <div className="space-y-2">
          <Label>Commission plateforme ({commissionRate}%)</Label>
          <div className="h-10 px-3 py-2 rounded-md border bg-muted text-muted-foreground flex items-center">
            {(commissionAmount / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
        </div>
      </div>

      <Separator />

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-sm">Répartition des montants</h4>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span>Montant brut</span>
            <span className="font-medium">{totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>- Commission plateforme ({commissionRate}%)</span>
            <span>-{(commissionAmount / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>- Frais Stripe (estimé ~1.5% + 0.25€)</span>
            <span>-{(stripeFeeEstimate / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold text-green-600">
            <span>Net créateur</span>
            <span>{(creatorNet / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_terms">Conditions de paiement</Label>
        <Textarea
          id="payment_terms"
          value={paymentTerms}
          onChange={e => setPaymentTerms(e.target.value)}
          placeholder="Ex: Paiement à la validation du contenu, sous 7 jours..."
          disabled={isLocked}
          rows={3}
        />
      </div>
    </div>
  );
}
