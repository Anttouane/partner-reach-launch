import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Contract } from '@/types/contract';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, ArrowDown } from 'lucide-react';

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
  const creatorNet = Math.round(totalAmount * 100 - commissionAmount);

  useEffect(() => {
    const handler = setTimeout(() => {
      onUpdate({
        total_amount: Math.round(totalAmount * 100),
        platform_commission_amount: commissionAmount,
        creator_net_amount: creatorNet,
        payment_terms: paymentTerms || null,
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [totalAmount, paymentTerms]);

  return (
    <div className="space-y-5">
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
            className="text-lg font-semibold"
          />
        </div>
        <div className="space-y-2">
          <Label>Commission plateforme ({commissionRate}%)</Label>
          <div className="h-10 px-3 py-2 rounded-md border bg-muted text-muted-foreground flex items-center">
            {(commissionAmount / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
        </div>
      </div>

      {/* Financial breakdown */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-muted/40 px-4 py-3 border-b border-border/40">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Répartition des montants
          </h4>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Montant brut</span>
            <span className="font-semibold text-base">{totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
          </div>
          
          <div className="space-y-2 pl-3 border-l-2 border-border/40">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ArrowDown className="h-3 w-3" />
                Commission plateforme ({commissionRate}%)
              </span>
              <span>-{(commissionAmount / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ArrowDown className="h-3 w-3" />
                Frais Stripe (estimé ~1.5% + 0.25€)
              </span>
              <span>-{(stripeFeeEstimate / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center rounded-lg bg-green-50 dark:bg-green-950/40 p-3 -mx-1">
            <span className="font-semibold text-green-700 dark:text-green-300">Net créateur</span>
            <span className="font-bold text-lg text-green-700 dark:text-green-300">
              {(creatorNet / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </span>
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
