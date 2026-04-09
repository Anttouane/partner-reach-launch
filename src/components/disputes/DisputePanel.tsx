import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, FileUp, Loader2, MessageSquare, Paperclip, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Dispute {
  id: string;
  contract_id: string;
  opened_by: string;
  reason: string;
  status: string;
  resolution_type: string | null;
  resolution_notes: string | null;
  created_at: string;
}

interface Evidence {
  id: string;
  dispute_id: string;
  user_id: string;
  file_url: string | null;
  description: string;
  evidence_type: string;
  created_at: string;
}

interface DisputePanelProps {
  contractId: string;
  userId: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Ouvert', variant: 'destructive' },
  in_review: { label: 'En cours d\'examen', variant: 'default' },
  resolved: { label: 'Résolu', variant: 'secondary' },
};

export function DisputePanel({ contractId, userId }: DisputePanelProps) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [profiles, setProfiles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDispute();
  }, [contractId]);

  const fetchDispute = async () => {
    const { data: disputes } = await supabase
      .from('disputes')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (disputes && disputes.length > 0) {
      const d = disputes[0] as Dispute;
      setDispute(d);
      await fetchEvidence(d.id);
    }
    setLoading(false);
  };

  const fetchEvidence = async (disputeId: string) => {
    const { data } = await supabase
      .from('dispute_evidence')
      .select('*')
      .eq('dispute_id', disputeId)
      .order('created_at', { ascending: true });

    if (data) {
      setEvidence(data as Evidence[]);
      const userIds = [...new Set([...data.map(e => e.user_id)])];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        const map = new Map(profilesData?.map(p => [p.id, p.full_name || 'Utilisateur']) || []);
        setProfiles(map);
      }
    }
  };

  const handleSubmitEvidence = async () => {
    if (!dispute || !description.trim()) {
      toast.error('Veuillez ajouter une description');
      return;
    }

    setSubmitting(true);
    let fileUrl: string | null = null;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${dispute.id}/${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('dispute-evidence')
        .upload(path, file);

      if (uploadError) {
        toast.error("Erreur lors de l'upload du fichier");
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('dispute-evidence')
        .getPublicUrl(path);
      fileUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from('dispute_evidence')
      .insert({
        dispute_id: dispute.id,
        user_id: userId,
        description: description.trim(),
        file_url: fileUrl,
        evidence_type: file ? 'file' : 'text',
      });

    if (error) {
      toast.error("Erreur lors de l'ajout de la preuve");
    } else {
      toast.success('Preuve ajoutée');
      setDescription('');
      setFile(null);
      await fetchEvidence(dispute.id);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!dispute) return null;

  const statusInfo = STATUS_MAP[dispute.status] || { label: dispute.status, variant: 'outline' as const };
  const isOpen = dispute.status === 'open';

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Litige en cours
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reason */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Motif du litige</p>
          <p className="text-sm bg-muted/50 rounded-lg p-3">{dispute.reason}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ouvert le {format(new Date(dispute.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        </div>

        {/* Resolution */}
        {dispute.status === 'resolved' && dispute.resolution_notes && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-950/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm text-green-800 dark:text-green-300">Décision de médiation</span>
            </div>
            <p className="text-sm text-green-800/80 dark:text-green-300/80">{dispute.resolution_notes}</p>
            {dispute.resolution_type && (
              <Badge variant="outline" className="mt-2">
                {dispute.resolution_type === 'release_funds' && 'Libération des fonds'}
                {dispute.resolution_type === 'refund' && 'Remboursement'}
                {dispute.resolution_type === 'partial_refund' && 'Remboursement partiel'}
                {dispute.resolution_type === 'cancelled' && 'Contrat annulé'}
              </Badge>
            )}
          </div>
        )}

        <Separator />

        {/* Evidence list */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Éléments et justificatifs ({evidence.length})
          </h4>
          
          {evidence.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun justificatif soumis pour le moment
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {evidence.map((e) => (
                <div
                  key={e.id}
                  className={`rounded-lg p-3 text-sm ${
                    e.user_id === userId
                      ? 'bg-primary/5 border border-primary/20 ml-4'
                      : 'bg-muted/50 border border-border mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs">
                      {profiles.get(e.user_id) || 'Utilisateur'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(e.created_at), "d MMM yyyy HH:mm", { locale: fr })}
                    </span>
                  </div>
                  <p>{e.description}</p>
                  {e.file_url && (
                    <a
                      href={e.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    >
                      <Paperclip className="h-3 w-3" />
                      Voir le fichier joint
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add evidence form */}
        {isOpen && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Ajouter un justificatif</h4>
              <div className="space-y-2">
                <Label htmlFor="evidence-desc">Description</Label>
                <Textarea
                  id="evidence-desc"
                  placeholder="Décrivez votre preuve : captures d'écran, échanges, contenu livré..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evidence-file">Fichier joint (optionnel)</Label>
                <Input
                  id="evidence-file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </div>
              <Button onClick={handleSubmitEvidence} disabled={submitting} size="sm">
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Soumettre
              </Button>
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <strong>Rappel :</strong> Partnery intervient uniquement comme intermédiaire technique et propose un service de médiation amiable entre les utilisateurs.
          Ce service ne constitue pas un conseil juridique ni un recours judiciaire. Les utilisateurs restent seuls responsables de leurs engagements contractuels.
        </div>
      </CardContent>
    </Card>
  );
}
