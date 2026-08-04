import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Users, Euro, Calendar, Sparkles, Layers } from "lucide-react";
import { useCampaignCandidates, type Candidate } from "@/hooks/useCampaignCandidates";
import CandidateCard from "@/components/campaigns/CandidateCard";
import CandidateDetailDialog from "@/components/campaigns/CandidateDetailDialog";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [sort, setSort] = useState<"score" | "audience">("score");
  const [selected, setSelected] = useState<Candidate | null>(null);

  const { candidates, loading: loadingCandidates, refresh, decide } = useCampaignCandidates(
    id,
    campaign?.network
  );

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      const { data: camp } = await supabase.from("campaigns").select("*").eq("id", id!).maybeSingle();
      setCampaign(camp);
      setLoading(false);
    })();
  }, [id, navigate]);

  const pending = candidates.filter((c) => c.brand_status === "pending");
  const approved = candidates.filter((c) => c.brand_status === "approved");

  const visible = useMemo(() => {
    const list =
      filter === "all" ? candidates : candidates.filter((c) => c.brand_status === filter);
    return [...list].sort((a, b) =>
      sort === "score"
        ? b.match_score - a.match_score
        : (b.main?.followers || 0) - (a.main?.followers || 0)
    );
  }, [candidates, filter, sort]);

  const generate = async () => {
    setGenerating(true);
    const { data, error } = await supabase.rpc("generate_campaign_matches", {
      _campaign_id: id!,
      _limit: Math.max(1, campaign?.creators_wanted || 1) * 3,
    });
    setGenerating(false);
    if (error) { toast.error(error.message); return; }
    const n = Number(data || 0);
    toast[n > 0 ? "success" : "info"](
      n > 0 ? `${n} nouveau(x) créateur(s) proposé(s)` : "Aucun nouveau créateur vérifié ne correspond"
    );
    refresh();
  };

  const handleDecide = async (candidate: Candidate, approve: boolean) => {
    const ok = await decide(candidate.match_id, approve);
    if (ok && selected?.match_id === candidate.match_id) setSelected(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!campaign) return <div className="min-h-screen"><Header user={user} /><p className="p-8 text-center">Campagne introuvable.</p></div>;

  const perCreator = campaign.price_per_creator
    ? Number(campaign.price_per_creator)
    : Number(campaign.budget_total) / Math.max(1, campaign.creators_wanted);
  const quotaReached = approved.length >= campaign.creators_wanted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title={`${campaign.name} | Partnery`} description="Créateurs proposés pour votre campagne." />
      <Header user={user} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-2xl">{campaign.name}</CardTitle>
              <Badge>{campaign.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {campaign.brand_brief && <p className="text-muted-foreground whitespace-pre-line">{campaign.brand_brief}</p>}
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1"><Euro className="h-4 w-4 text-primary" /> Budget : {campaign.budget_total} € ({perCreator.toFixed(0)} €/créateur)</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> {campaign.creators_wanted} créateurs recherchés</span>
              {campaign.deadline && <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-primary" /> {new Date(campaign.deadline).toLocaleDateString("fr-FR")}</span>}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold">Créateurs proposés</h2>
            <p className="text-sm text-muted-foreground">
              {pending.length} à traiter · {approved.length}/{campaign.creators_wanted} validés
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Chercher de nouveaux créateurs
            </Button>
            {pending.length > 0 && (
              <Button onClick={() => navigate(`/campaigns/${id}/swipe`)}>
                <Layers className="h-4 w-4 mr-2" /> Mode swipe
              </Button>
            )}
          </div>
        </div>

        {quotaReached && (
          <Card className="mb-4 border-primary/40">
            <CardContent className="py-3 text-sm">
              Vous avez validé {approved.length} créateur(s) sur les {campaign.creators_wanted} recherchés. Vous pouvez
              en valider davantage, mais votre budget prévisionnel sera dépassé.
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="pending">À traiter ({pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Validés ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Écartés</TabsTrigger>
              <TabsTrigger value="all">Tous</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Trier par score</SelectItem>
              <SelectItem value="audience">Trier par audience</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loadingCandidates ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : visible.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">
            Aucun créateur dans cette liste pour l'instant.
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {visible.map((c) => (
              <CandidateCard
                key={c.match_id}
                candidate={c}
                onOpen={() => setSelected(c)}
                onDecide={(approve) => handleDecide(c, approve)}
              />
            ))}
          </div>
        )}

        <CandidateDetailDialog
          candidate={selected}
          open={!!selected}
          onOpenChange={(v) => !v && setSelected(null)}
          onDecide={(approve) => selected && handleDecide(selected, approve)}
        />
      </main>
    </div>
  );
};

export default CampaignDetail;
