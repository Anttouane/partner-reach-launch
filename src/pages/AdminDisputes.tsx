import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Shield, AlertTriangle, FileText, Eye, CheckCircle, XCircle, MessageSquare, Euro, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Contract, ContractStatus, CONTRACT_STATUS_LABELS } from "@/types/contract";

interface EnrichedDispute {
  id: string;
  contract_id: string;
  opened_by: string;
  reason: string;
  status: string;
  resolution_type: string | null;
  resolution_notes: string | null;
  created_at: string;
  contract?: Contract;
  brand_name?: string | null;
  creator_name?: string | null;
  opener_name?: string | null;
  evidence_count: number;
  evidence?: Array<{
    id: string;
    user_id: string;
    description: string;
    file_url: string | null;
    evidence_type: string;
    created_at: string;
    user_name?: string;
  }>;
}

export default function AdminDisputes() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [disputes, setDisputes] = useState<EnrichedDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<EnrichedDispute | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolution, setResolution] = useState<string>("release_funds");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [contractResolution, setContractResolution] = useState<"completed" | "cancelled">("completed");
  const [resolving, setResolving] = useState(false);

  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles").select("*").eq("id", session.user.id).single();
        setUser({ ...session.user, ...profile });
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!adminLoading && !authLoading && !isAdmin) {
      toast.error("Accès refusé.");
      navigate("/dashboard");
    }
  }, [isAdmin, adminLoading, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchDisputes();
  }, [isAdmin]);

  const fetchDisputes = async () => {
    setLoading(true);

    const { data: disputesData, error } = await supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !disputesData) {
      toast.error("Erreur lors du chargement des litiges");
      setLoading(false);
      return;
    }

    // Fetch contracts
    const contractIds = [...new Set(disputesData.map(d => d.contract_id))];
    const { data: contracts } = await supabase
      .from("contracts").select("*").in("id", contractIds);

    const contractMap = new Map((contracts || []).map(c => [c.id, c]));

    // Fetch profiles
    const allUserIds = new Set<string>();
    disputesData.forEach(d => allUserIds.add(d.opened_by));
    (contracts || []).forEach(c => { allUserIds.add(c.brand_id); allUserIds.add(c.creator_id); });

    const { data: profiles } = await supabase
      .from("profiles").select("id, full_name").in("id", [...allUserIds]);
    const profileMap = new Map((profiles || []).map(p => [p.id, p.full_name]));

    // Fetch evidence counts
    const disputeIds = disputesData.map(d => d.id);
    const { data: evidenceData } = await supabase
      .from("dispute_evidence").select("dispute_id").in("dispute_id", disputeIds);

    const evidenceCountMap = new Map<string, number>();
    evidenceData?.forEach(e => {
      evidenceCountMap.set(e.dispute_id, (evidenceCountMap.get(e.dispute_id) || 0) + 1);
    });

    const enriched: EnrichedDispute[] = disputesData.map(d => {
      const contract = contractMap.get(d.contract_id) as Contract | undefined;
      return {
        ...d,
        contract,
        brand_name: contract ? (profileMap.get(contract.brand_id) || contract.brand_name) : null,
        creator_name: contract ? (profileMap.get(contract.creator_id) || contract.creator_name) : null,
        opener_name: profileMap.get(d.opened_by) || null,
        evidence_count: evidenceCountMap.get(d.id) || 0,
      };
    });

    setDisputes(enriched);
    setLoading(false);
  };

  const handleViewDetails = async (dispute: EnrichedDispute) => {
    // Fetch evidence for this dispute
    const { data: evidenceData } = await supabase
      .from("dispute_evidence")
      .select("*")
      .eq("dispute_id", dispute.id)
      .order("created_at", { ascending: true });

    const userIds = [...new Set((evidenceData || []).map(e => e.user_id))];
    const { data: profiles } = await supabase
      .from("profiles").select("id, full_name").in("id", userIds);
    const profileMap = new Map((profiles || []).map(p => [p.id, p.full_name || "Utilisateur"]));

    setSelectedDispute({
      ...dispute,
      evidence: (evidenceData || []).map(e => ({
        ...e,
        user_name: profileMap.get(e.user_id) || "Utilisateur",
      })),
    });
    setIsDetailOpen(true);
  };

  const handleOpenResolve = (dispute: EnrichedDispute) => {
    setSelectedDispute(dispute);
    setResolution("release_funds");
    setContractResolution("completed");
    setResolutionNotes("");
    setIsResolveOpen(true);
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    setResolving(true);

    // Update dispute
    const { error: disputeError } = await supabase
      .from("disputes")
      .update({
        status: "resolved",
        resolution_type: resolution,
        resolution_notes: resolutionNotes,
        resolved_by: user?.id,
      })
      .eq("id", selectedDispute.id);

    if (disputeError) {
      toast.error("Erreur lors de la résolution");
      setResolving(false);
      return;
    }

    // Update contract status
    const { error: contractError } = await supabase
      .from("contracts")
      .update({
        status: contractResolution as ContractStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedDispute.contract_id);

    if (contractError) {
      console.error(contractError);
    }

    toast.success(`Litige résolu — Contrat marqué comme "${CONTRACT_STATUS_LABELS[contractResolution]}"`);
    setIsResolveOpen(false);
    fetchDisputes();
    setResolving(false);
  };

  const openCount = disputes.filter(d => d.status === "open").length;
  const totalAmount = disputes
    .filter(d => d.status === "open")
    .reduce((sum, d) => sum + (d.contract?.total_amount || 0), 0);

  if (adminLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestion des Litiges</h1>
            <p className="text-muted-foreground">Médiation amiable — Partnery intervient comme intermédiaire technique</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Litiges ouverts</p>
                  <p className="text-2xl font-bold">{openCount}</p>
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
                  <p className="text-sm text-muted-foreground">Montant en litige</p>
                  <p className="text-2xl font-bold">{(totalAmount / 100).toLocaleString('fr-FR')} €</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total litiges</p>
                  <p className="text-2xl font-bold">{disputes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Tous les litiges
            </CardTitle>
            <CardDescription>Médiation amiable — les décisions sont des recommandations, pas des jugements</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-lg font-medium">Aucun litige</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campagne</TableHead>
                      <TableHead>Ouvert par</TableHead>
                      <TableHead>Marque</TableHead>
                      <TableHead>Créateur</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Preuves</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.contract?.campaign_title || "—"}</TableCell>
                        <TableCell>{d.opener_name || "—"}</TableCell>
                        <TableCell>{d.brand_name || "—"}</TableCell>
                        <TableCell>{d.creator_name || "—"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {d.contract ? `${(d.contract.total_amount / 100).toLocaleString('fr-FR')} €` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {d.evidence_count}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.status === "open" ? "destructive" : d.status === "resolved" ? "secondary" : "default"}>
                            {d.status === "open" ? "Ouvert" : d.status === "resolved" ? "Résolu" : d.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(d.created_at), "dd MMM yyyy", { locale: fr })}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(d)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {d.contract && (
                              <Button variant="outline" size="sm" onClick={() => navigate(`/contract/${d.contract_id}`)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            {d.status === "open" && (
                              <Button size="sm" onClick={() => handleOpenResolve(d)}>Résoudre</Button>
                            )}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du litige</DialogTitle>
            <DialogDescription>{selectedDispute?.contract?.campaign_title}</DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ouvert par</p>
                  <p className="font-medium">{selectedDispute.opener_name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(selectedDispute.created_at), "dd MMMM yyyy HH:mm", { locale: fr })}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Motif</p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{selectedDispute.reason}</p>
              </div>

              {selectedDispute.contract && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Montant total</p>
                    <p className="text-lg font-bold">{(selectedDispute.contract.total_amount / 100).toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marque</p>
                    <p className="font-medium">{selectedDispute.brand_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Créateur</p>
                    <p className="font-medium">{selectedDispute.creator_name || "—"}</p>
                  </div>
                </div>
              )}

              {/* Evidence */}
              <div>
                <h4 className="text-sm font-medium mb-2">Justificatifs ({selectedDispute.evidence?.length || 0})</h4>
                {selectedDispute.evidence && selectedDispute.evidence.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedDispute.evidence.map(e => (
                      <div key={e.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs">{e.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(e.created_at), "d MMM yyyy HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <p>{e.description}</p>
                        {e.file_url && (
                          <a href={e.file_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                            <Paperclip className="h-3 w-3" /> Fichier joint
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun justificatif soumis</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Fermer</Button>
            {selectedDispute?.status === "open" && (
              <Button onClick={() => { setIsDetailOpen(false); if (selectedDispute) handleOpenResolve(selectedDispute); }}>
                Résoudre ce litige
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résoudre le litige</DialogTitle>
            <DialogDescription>
              Médiation amiable pour "{selectedDispute?.contract?.campaign_title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type de résolution</label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="release_funds">Libérer les fonds au créateur</SelectItem>
                  <SelectItem value="refund">Remboursement à la marque</SelectItem>
                  <SelectItem value="partial_refund">Remboursement partiel</SelectItem>
                  <SelectItem value="cancelled">Annulation du contrat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Action sur le contrat</label>
              <Select value={contractResolution} onValueChange={(v) => setContractResolution(v as "completed" | "cancelled")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Terminé — Valider le contrat
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      Annulé — Annuler le contrat
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Notes de résolution</label>
              <Textarea
                className="mt-1"
                placeholder="Expliquez la décision prise et les raisons..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <strong>Rappel :</strong> cette décision est une recommandation de médiation amiable. Partnery n'agit pas en tant qu'autorité judiciaire.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveOpen(false)}>Annuler</Button>
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
