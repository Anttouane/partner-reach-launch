import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Shield, AlertTriangle, FileText, Eye, CheckCircle, XCircle, MessageSquare, Euro } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Contract, ContractStatus, CONTRACT_STATUS_LABELS } from "@/types/contract";

interface DisputedContract extends Contract {
  brand_profile?: { full_name: string | null };
  creator_profile?: { full_name: string | null };
  comments_count?: number;
}

export default function AdminDisputes() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [disputes, setDisputes] = useState<DisputedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<DisputedContract | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolution, setResolution] = useState<"completed" | "cancelled">("completed");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser({ ...session.user, ...profile });
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && !authLoading && !isAdmin) {
      toast.error("Accès refusé. Vous n'avez pas les droits administrateur.");
      navigate("/dashboard");
    }
  }, [isAdmin, adminLoading, authLoading, navigate]);

  // Fetch disputed contracts
  useEffect(() => {
    if (isAdmin) {
      fetchDisputes();
    }
  }, [isAdmin]);

  const fetchDisputes = async () => {
    setLoading(true);
    
    // Fetch disputed contracts with profiles
    const { data: contractsData, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("status", "disputed")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching disputes:", error);
      toast.error("Erreur lors du chargement des litiges");
      setLoading(false);
      return;
    }

    // Fetch profiles for brands and creators
    const contracts = contractsData as Contract[];
    const brandIds = [...new Set(contracts.map(c => c.brand_id))];
    const creatorIds = [...new Set(contracts.map(c => c.creator_id))];
    const allUserIds = [...new Set([...brandIds, ...creatorIds])];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", allUserIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Fetch comment counts
    const { data: commentCounts } = await supabase
      .from("contract_comments")
      .select("contract_id")
      .in("contract_id", contracts.map(c => c.id));

    const commentCountMap = new Map<string, number>();
    commentCounts?.forEach(c => {
      commentCountMap.set(c.contract_id, (commentCountMap.get(c.contract_id) || 0) + 1);
    });

    const enrichedDisputes: DisputedContract[] = contracts.map(contract => ({
      ...contract,
      brand_profile: profileMap.get(contract.brand_id),
      creator_profile: profileMap.get(contract.creator_id),
      comments_count: commentCountMap.get(contract.id) || 0,
    }));

    setDisputes(enrichedDisputes);
    setLoading(false);
  };

  const handleViewDetails = (dispute: DisputedContract) => {
    setSelectedDispute(dispute);
    setIsDetailOpen(true);
  };

  const handleOpenResolve = (dispute: DisputedContract) => {
    setSelectedDispute(dispute);
    setResolution("completed");
    setResolutionNotes("");
    setIsResolveOpen(true);
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    
    setResolving(true);

    const { error } = await supabase
      .from("contracts")
      .update({
        status: resolution as ContractStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedDispute.id);

    if (error) {
      toast.error("Erreur lors de la résolution du litige");
      console.error(error);
    } else {
      toast.success(`Litige résolu - Contrat marqué comme "${CONTRACT_STATUS_LABELS[resolution]}"`);
      setIsResolveOpen(false);
      fetchDisputes();
    }
    
    setResolving(false);
  };

  const stats = {
    total: disputes.length,
    highValue: disputes.filter(d => d.total_amount >= 100000).length, // >= 1000€
    recentlyOpened: disputes.filter(d => {
      const updatedAt = new Date(d.updated_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return updatedAt > dayAgo;
    }).length,
    totalAmount: disputes.reduce((sum, d) => sum + d.total_amount, 0),
  };

  if (adminLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestion des Litiges</h1>
            <p className="text-muted-foreground">Contrats en statut "Litige" nécessitant une intervention</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Litiges ouverts</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/10">
                  <Euro className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant total en litige</p>
                  <p className="text-2xl font-bold">{(stats.totalAmount / 100).toLocaleString('fr-FR')} €</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Litiges haute valeur</p>
                  <p className="text-2xl font-bold">{stats.highValue}</p>
                  <p className="text-xs text-muted-foreground">≥ 1 000 €</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ouverts récemment</p>
                  <p className="text-2xl font-bold">{stats.recentlyOpened}</p>
                  <p className="text-xs text-muted-foreground">Dernières 24h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disputes Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Litiges en attente
            </CardTitle>
            <CardDescription>
              Contrats nécessitant une médiation ou une décision administrative
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-lg font-medium">Aucun litige en cours</p>
                <p className="text-sm">Tous les contrats sont en ordre</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campagne</TableHead>
                      <TableHead>Marque</TableHead>
                      <TableHead>Créateur</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Commentaires</TableHead>
                      <TableHead>Date litige</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell>
                          <div className="font-medium">{dispute.campaign_title}</div>
                          <div className="text-xs text-muted-foreground">
                            Version {dispute.version}
                          </div>
                        </TableCell>
                        <TableCell>
                          {dispute.brand_profile?.full_name || dispute.brand_name || "—"}
                        </TableCell>
                        <TableCell>
                          {dispute.creator_profile?.full_name || dispute.creator_name || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(dispute.total_amount / 100).toLocaleString('fr-FR')} €
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {dispute.comments_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(dispute.updated_at), "dd MMM yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/contract/${dispute.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(dispute)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOpenResolve(dispute)}
                            >
                              Résoudre
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du litige</DialogTitle>
            <DialogDescription>
              {selectedDispute?.campaign_title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDispute && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Marque</p>
                  <p className="font-medium">{selectedDispute.brand_profile?.full_name || selectedDispute.brand_name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Créateur</p>
                  <p className="font-medium">{selectedDispute.creator_profile?.full_name || selectedDispute.creator_name || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Montant total</p>
                  <p className="text-lg font-bold">{(selectedDispute.total_amount / 100).toLocaleString('fr-FR')} €</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commission plateforme</p>
                  <p className="font-medium">{(selectedDispute.platform_commission_amount / 100).toLocaleString('fr-FR')} €</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net créateur</p>
                  <p className="font-medium">{(selectedDispute.creator_net_amount / 100).toLocaleString('fr-FR')} €</p>
                </div>
              </div>

              {selectedDispute.campaign_description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedDispute.campaign_description}</p>
                </div>
              )}

              {selectedDispute.deliverables && selectedDispute.deliverables.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Livrables</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedDispute.deliverables.map((d, i) => (
                      <Badge key={i} variant="secondary">{d}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Signé par marque</p>
                  <p>{selectedDispute.brand_signed_at 
                    ? format(new Date(selectedDispute.brand_signed_at), "dd/MM/yyyy HH:mm", { locale: fr })
                    : "Non signé"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Signé par créateur</p>
                  <p>{selectedDispute.creator_signed_at 
                    ? format(new Date(selectedDispute.creator_signed_at), "dd/MM/yyyy HH:mm", { locale: fr })
                    : "Non signé"}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setIsDetailOpen(false);
              if (selectedDispute) handleOpenResolve(selectedDispute);
            }}>
              Résoudre ce litige
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résoudre le litige</DialogTitle>
            <DialogDescription>
              Choisissez la résolution pour le contrat "{selectedDispute?.campaign_title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Décision</label>
              <Select value={resolution} onValueChange={(v) => setResolution(v as "completed" | "cancelled")}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Terminé - Valider le contrat
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Annulé - Annuler le contrat
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Notes de résolution (optionnel)</label>
              <Textarea
                className="mt-1"
                placeholder="Expliquez la décision prise..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleResolveDispute} disabled={resolving}>
              {resolving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmer la résolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
