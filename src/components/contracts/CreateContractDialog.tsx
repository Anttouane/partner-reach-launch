import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  brandId: string;
  creatorId: string;
  brandName?: string;
  creatorName?: string;
  contextTitle?: string; // From pitch or opportunity
}

export function CreateContractDialog({
  open,
  onOpenChange,
  conversationId,
  brandId,
  creatorId,
  brandName,
  creatorName,
  contextTitle,
}: CreateContractDialogProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    campaign_title: contextTitle || '',
    campaign_description: '',
    total_amount: '',
  });

  const handleCreate = async () => {
    if (!formData.campaign_title) {
      toast.error('Le titre de la campagne est requis');
      return;
    }

    setLoading(true);

    try {
      const totalAmount = parseFloat(formData.total_amount) * 100 || 0;
      const commissionRate = 5.00;
      const commissionAmount = Math.round(totalAmount * (commissionRate / 100));
      const stripeFeeEstimate = Math.round(totalAmount * 0.029 + 25);
      const creatorNetAmount = Math.round(totalAmount - commissionAmount - stripeFeeEstimate);

      const { data, error } = await supabase
        .from('contracts')
        .insert({
          conversation_id: conversationId,
          brand_id: brandId,
          creator_id: creatorId,
          brand_name: brandName,
          creator_name: creatorName,
          campaign_title: formData.campaign_title,
          campaign_description: formData.campaign_description || null,
          total_amount: totalAmount,
          platform_commission_rate: commissionRate,
          platform_commission_amount: commissionAmount,
          stripe_fee_estimate: stripeFeeEstimate,
          creator_net_amount: creatorNetAmount,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Contrat créé avec succès');
      onOpenChange(false);
      navigate(`/contract/${data.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la création du contrat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générer un contrat
          </DialogTitle>
          <DialogDescription>
            Créez un contrat de partenariat que les deux parties pourront éditer et signer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="campaign_title">Titre de la campagne *</Label>
            <Input
              id="campaign_title"
              value={formData.campaign_title}
              onChange={e => setFormData(prev => ({ ...prev, campaign_title: e.target.value }))}
              placeholder="Ex: Campagne été 2025"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign_description">Description (optionnel)</Label>
            <Textarea
              id="campaign_description"
              value={formData.campaign_description}
              onChange={e => setFormData(prev => ({ ...prev, campaign_description: e.target.value }))}
              placeholder="Décrivez brièvement la campagne..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_amount">Montant proposé (€)</Label>
            <Input
              id="total_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.total_amount}
              onChange={e => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Vous pourrez modifier ce montant dans le contrat
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Créer le contrat
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
