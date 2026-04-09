import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface OpenDisputeDialogProps {
  contractId: string;
  userId: string;
  onDisputeOpened?: () => void;
}

export function OpenDisputeDialog({ contractId, userId, onDisputeOpened }: OpenDisputeDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim() || reason.trim().length < 20) {
      toast.error('Veuillez décrire le motif du litige (minimum 20 caractères)');
      return;
    }

    setSubmitting(true);

    // Open dispute
    const { error: disputeError } = await supabase
      .from('disputes')
      .insert({
        contract_id: contractId,
        opened_by: userId,
        reason: reason.trim(),
        status: 'open',
      });

    if (disputeError) {
      toast.error("Erreur lors de l'ouverture du litige");
      console.error(disputeError);
      setSubmitting(false);
      return;
    }

    // Update contract status to disputed
    const { error: contractError } = await supabase
      .from('contracts')
      .update({ status: 'disputed', updated_at: new Date().toISOString() })
      .eq('id', contractId);

    if (contractError) {
      console.error(contractError);
    }

    toast.success('Litige ouvert avec succès');
    setOpen(false);
    setReason('');
    setSubmitting(false);
    onDisputeOpened?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Ouvrir un litige
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Ouvrir un litige
          </DialogTitle>
          <DialogDescription>
            Décrivez le problème rencontré. Les deux parties pourront soumettre des preuves et Partnery interviendra comme médiateur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800/50 dark:bg-orange-950/30 p-3">
            <p className="text-xs text-orange-800 dark:text-orange-300">
              <strong>Important :</strong> Partnery agit uniquement comme intermédiaire technique et propose un service de médiation amiable.
              Ce service ne constitue pas un recours juridique. Toute contestation peut être portée devant les juridictions compétentes.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispute-reason">Motif du litige *</Label>
            <Textarea
              id="dispute-reason"
              placeholder="Décrivez précisément le problème : non-livraison, contenu non conforme, retard, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">{reason.length}/2000 caractères</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirmer le litige
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
