import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Header from '@/components/Header';
import { useContract } from '@/hooks/useContract';
import { Contract, ContractSection } from '@/types/contract';
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge';
import { ContractSectionCard } from '@/components/contracts/ContractSectionCard';
import { ContractFinancialSection } from '@/components/contracts/ContractFinancialSection';
import { ContractSignatureSection } from '@/components/contracts/ContractSignatureSection';
import { ContractHistory } from '@/components/contracts/ContractHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  FileText,
  Check,
  X,
  Download,
  Save,
  RefreshCw,
  Users,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ user_type: string } | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Partial<Contract>>({});
  const [saving, setSaving] = useState(false);

  const {
    contract,
    changes,
    comments,
    loading,
    updateContract,
    requestRevision,
    approveContract,
    signContract,
    addComment,
    resolveComment,
  } = useContract(id);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();

      setUserProfile(profile);
    };

    checkUser();
  }, [navigate]);

  const isLocked = contract?.locked_at !== null;
  const isBrand = user?.id === contract?.brand_id;
  const isCreator = user?.id === contract?.creator_id;
  const canEdit = (isBrand || isCreator) && !isLocked;

  const handleFieldChange = (field: keyof Contract, value: any) => {
    setPendingChanges(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user || Object.keys(pendingChanges).length === 0) return;
    
    setSaving(true);
    const success = await updateContract(pendingChanges, user.id);
    if (success) {
      toast.success('Modifications enregistrées');
      setPendingChanges({});
    }
    setSaving(false);
  };

  const handleRequestRevision = async () => {
    if (!user) return;
    const success = await requestRevision(user.id);
    if (success) {
      toast.success('Révision demandée');
    }
  };

  const handleApprove = async () => {
    if (!user) return;
    const success = await approveContract(user.id);
    if (success) {
      toast.success('Contrat approuvé - prêt à signer');
    }
  };

  const handleSign = async () => {
    if (!user) return;
    // Get IP address
    const ipAddress = 'hidden'; // In production, get this from the server
    const success = await signContract(user.id, isBrand, ipAddress);
    if (success) {
      toast.success('Contrat signé avec succès');
    }
  };

  const handleExportPDF = async () => {
    if (!contract) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-contract-pdf', {
        body: { contractId: contract.id },
      });

      if (error) throw error;

      // Download the PDF
      const link = document.createElement('a');
      link.href = data.url;
      link.download = `contrat-${contract.id}.pdf`;
      link.click();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const handleAddComment = async (section: ContractSection, content: string) => {
    if (!user) return;
    await addComment(user.id, section, content);
  };

  const handleResolveComment = async (commentId: string) => {
    if (!user) return;
    await resolveComment(commentId, user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Header user={user} />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Header user={user} />
        <main className="container mx-auto px-4 py-8 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Contrat introuvable</h1>
          <p className="text-muted-foreground mb-4">
            Ce contrat n'existe pas ou vous n'avez pas les permissions pour le voir.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </main>
      </div>
    );
  }

  const getValue = (field: keyof Contract) => {
    return pendingChanges[field] !== undefined ? pendingChanges[field] : contract[field];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Contrat de partenariat</h1>
                <ContractStatusBadge status={contract.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Version {contract.version} · Créé le {format(new Date(contract.created_at), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {Object.keys(pendingChanges).length > 0 && (
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            )}
            {contract.status === 'signed' && (
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Exporter PDF
              </Button>
            )}
          </div>
        </div>

        {/* Action bar for approval/revision */}
        {canEdit && contract.status !== 'ready_to_sign' && contract.status !== 'signed' && (
          <Card className="mb-6 border-primary/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <span>
                    {contract.status === 'draft' && 'Contrat en brouillon - Modifiez et approuvez quand prêt'}
                    {contract.status === 'revision_requested' && 'Révision demandée - Vérifiez les modifications'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRequestRevision}>
                    <X className="h-4 w-4 mr-1" />
                    Demander révision
                  </Button>
                  <Button size="sm" onClick={handleApprove}>
                    <Check className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section A: Parties */}
        <ContractSectionCard
          section="parties"
          comments={comments}
          changes={changes}
          isLocked={isLocked}
          onAddComment={(content) => handleAddComment('parties', content)}
          onResolveComment={handleResolveComment}
          currentUserId={user?.id || ''}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Marque</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_name">Nom</Label>
                <Input
                  id="brand_name"
                  value={getValue('brand_name') || ''}
                  onChange={e => handleFieldChange('brand_name', e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_company">Société</Label>
                <Input
                  id="brand_company"
                  value={getValue('brand_company') || ''}
                  onChange={e => handleFieldChange('brand_company', e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand_address">Adresse</Label>
                <Textarea
                  id="brand_address"
                  value={getValue('brand_address') || ''}
                  onChange={e => handleFieldChange('brand_address', e.target.value)}
                  disabled={!canEdit}
                  rows={2}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Créateur</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="creator_name">Nom</Label>
                <Input
                  id="creator_name"
                  value={getValue('creator_name') || ''}
                  onChange={e => handleFieldChange('creator_name', e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creator_address">Adresse</Label>
                <Textarea
                  id="creator_address"
                  value={getValue('creator_address') || ''}
                  onChange={e => handleFieldChange('creator_address', e.target.value)}
                  disabled={!canEdit}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </ContractSectionCard>

        {/* Section B: Campaign Details */}
        <ContractSectionCard
          section="campaign"
          comments={comments}
          changes={changes}
          isLocked={isLocked}
          onAddComment={(content) => handleAddComment('campaign', content)}
          onResolveComment={handleResolveComment}
          currentUserId={user?.id || ''}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign_title">Titre de la campagne</Label>
              <Input
                id="campaign_title"
                value={getValue('campaign_title') || ''}
                onChange={e => handleFieldChange('campaign_title', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_description">Description</Label>
              <Textarea
                id="campaign_description"
                value={getValue('campaign_description') || ''}
                onChange={e => handleFieldChange('campaign_description', e.target.value)}
                disabled={!canEdit}
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deadline">Date limite</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={getValue('deadline') ? format(new Date(getValue('deadline') as string), 'yyyy-MM-dd') : ''}
                  onChange={e => handleFieldChange('deadline', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exclusivity_period">Période d'exclusivité (jours)</Label>
                <Input
                  id="exclusivity_period"
                  type="number"
                  min="0"
                  value={getValue('exclusivity_period') || ''}
                  onChange={e => handleFieldChange('exclusivity_period', parseInt(e.target.value) || null)}
                  disabled={!canEdit}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usage_rights">Droits d'utilisation</Label>
              <Textarea
                id="usage_rights"
                value={getValue('usage_rights') || ''}
                onChange={e => handleFieldChange('usage_rights', e.target.value)}
                placeholder="Ex: Droits d'usage sur les réseaux sociaux pendant 12 mois..."
                disabled={!canEdit}
                rows={3}
              />
            </div>
          </div>
        </ContractSectionCard>

        {/* Section C: Financial Terms */}
        <ContractSectionCard
          section="financial"
          comments={comments}
          changes={changes}
          isLocked={isLocked}
          onAddComment={(content) => handleAddComment('financial', content)}
          onResolveComment={handleResolveComment}
          currentUserId={user?.id || ''}
        >
          <ContractFinancialSection
            contract={{ ...contract, ...pendingChanges } as Contract}
            isLocked={isLocked}
            onUpdate={(updates) => {
              for (const [key, value] of Object.entries(updates)) {
                handleFieldChange(key as keyof Contract, value);
              }
            }}
          />
        </ContractSectionCard>

        {/* Section D: Obligations */}
        <ContractSectionCard
          section="obligations"
          comments={comments}
          changes={changes}
          isLocked={isLocked}
          onAddComment={(content) => handleAddComment('obligations', content)}
          onResolveComment={handleResolveComment}
          currentUserId={user?.id || ''}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand_obligations">Obligations de la marque</Label>
              <Textarea
                id="brand_obligations"
                value={getValue('brand_obligations') || ''}
                onChange={e => handleFieldChange('brand_obligations', e.target.value)}
                placeholder="Ex: Fournir les produits, briefing créatif..."
                disabled={!canEdit}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creator_obligations">Obligations du créateur</Label>
              <Textarea
                id="creator_obligations"
                value={getValue('creator_obligations') || ''}
                onChange={e => handleFieldChange('creator_obligations', e.target.value)}
                placeholder="Ex: Publier X posts, respecter les guidelines..."
                disabled={!canEdit}
                rows={5}
              />
            </div>
          </div>
        </ContractSectionCard>

        {/* Section E: Validation & Disputes */}
        <ContractSectionCard
          section="validation"
          comments={comments}
          changes={changes}
          isLocked={isLocked}
          onAddComment={(content) => handleAddComment('validation', content)}
          onResolveComment={handleResolveComment}
          currentUserId={user?.id || ''}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="validation_deadline_days">Délai de validation (jours)</Label>
              <Input
                id="validation_deadline_days"
                type="number"
                min="1"
                value={getValue('validation_deadline_days') || 7}
                onChange={e => handleFieldChange('validation_deadline_days', parseInt(e.target.value) || 7)}
                disabled={!canEdit}
              />
              <p className="text-xs text-muted-foreground">
                Nombre de jours pour valider le contenu après livraison
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispute_resolution">Résolution des litiges</Label>
              <Textarea
                id="dispute_resolution"
                value={getValue('dispute_resolution') || ''}
                onChange={e => handleFieldChange('dispute_resolution', e.target.value)}
                placeholder="Ex: En cas de litige, les parties s'engagent à chercher une résolution amiable..."
                disabled={!canEdit}
                rows={4}
              />
            </div>
          </div>
        </ContractSectionCard>

        {/* Section F: Signatures */}
        <ContractSignatureSection
          contract={contract}
          currentUserId={user?.id || ''}
          isBrand={isBrand}
          onSign={handleSign}
        />

        {/* Section G: Change History */}
        <div className="mt-6">
          <ContractHistory changes={changes} />
        </div>
      </main>
    </div>
  );
};

export default ContractDetail;
