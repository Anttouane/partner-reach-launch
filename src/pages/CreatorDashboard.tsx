import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import KpiTiles from "@/components/dashboard/KpiTiles";
import MonthlyAreaChart from "@/components/dashboard/MonthlyAreaChart";
import { monthlySeries, euros } from "@/hooks/useDashboardAnalytics";
import { toast } from "sonner";
import { Check, X, Loader2, Calendar, Euro, Wallet, Hourglass, CheckCircle2, Percent } from "lucide-react";

interface Proposal {
  id: string;
  campaign_id: string;
  creator_status: string;
  campaigns: {
    id: string;
    name: string;
    description: string | null;
    budget_total: number;
    creators_wanted: number;
    deadline: string | null;
    brand_id: string;
  } | null;
}

interface CollabRow {
  id: string;
  status: string;
  amount: number;
  commission: number;
  created_at: string;
  released_at: string | null;
  campaigns: { name: string } | null;
}

const CreatorDashboard = ({ user }: { user: User }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [collabs, setCollabs] = useState<CollabRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("campaign_matches")
      .select("id, campaign_id, creator_status, campaigns(id, name, description, budget_total, creators_wanted, deadline, brand_id)")
      .eq("creator_id", user.id)
      .eq("brand_status", "approved")
      .order("created_at", { ascending: false });
    setProposals((data as any) || []);

    const { data: co } = await supabase
      .from("collabs")
      .select("id, status, amount, commission, created_at, released_at, campaigns(name)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });
    setCollabs(((co || []) as any[]).map(c => ({ ...c, amount: Number(c.amount), commission: Number(c.commission || 0) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user.id]);

  const decide = async (matchId: string, campaignId: string, accept: boolean) => {
    const status = accept ? "accepted" : "refused";
    const { error } = await supabase
      .from("campaign_matches")
      .update({ creator_status: status })
      .eq("id", matchId);
    if (error) { toast.error(error.message); return; }

    if (accept) {
      const [{ data: camp }, { data: setting }] = await Promise.all([
        supabase.from("campaigns").select("budget_total, creators_wanted").eq("id", campaignId).maybeSingle(),
        supabase.from("platform_settings").select("setting_value").eq("setting_key", "partnery_commission").maybeSingle(),
      ]);
      if (camp) {
        const rate = Number((setting as any)?.setting_value) || 15;
        const amount = Number(camp.budget_total) / Math.max(1, camp.creators_wanted);
        const commission = amount * (rate / 100);
        const { data: collab } = await supabase.from("collabs").insert({
          campaign_id: campaignId,
          creator_id: user.id,
          match_id: matchId,
          amount,
          commission,
          status: "awaiting_payment",
        }).select().single();
        toast.success("Collaboration lancée !");
        if (collab) navigate(`/collab/${collab.id}`);
        return;
      }
    } else {
      toast.info("Proposition refusée");
    }
    load();
  };

  const net = (c: CollabRow) => c.amount - c.commission;
  const released = collabs.filter(c => c.status === "released");
  const pending = collabs.filter(c => ["escrowed", "delivered"].includes(c.status));
  const earnings = released.reduce((s, c) => s + net(c), 0);
  const pendingAmount = pending.reduce((s, c) => s + net(c), 0);
  const answered = proposals.filter(p => p.creator_status !== "pending").length;
  const acceptedProposals = proposals.filter(p => p.creator_status === "accepted").length;
  const acceptanceRate = answered > 0 ? (acceptedProposals / answered) * 100 : 0;

  const revenueData = monthlySeries(
    released,
    c => c.released_at || c.created_at,
    { revenue: c => net(c) },
  );

  const perf = [
    { label: "Propositions reçues", value: proposals.length, progress: Math.min(proposals.length * 10, 100) },
    { label: "Propositions acceptées", value: acceptedProposals, progress: acceptanceRate },
    { label: "Collabs payées", value: collabs.filter(c => c.status !== "awaiting_payment").length, progress: Math.min(collabs.length * 10, 100) },
    { label: "Collabs terminées", value: released.length, progress: collabs.length ? (released.length / collabs.length) * 100 : 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title="Dashboard créateur | Partnery" description="Vos propositions, vos revenus et vos performances." />
      <Header user={user} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Propositions pour vous</h1>
          <p className="text-muted-foreground">Ces campagnes correspondent à votre profil. Acceptez en un clic.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <KpiTiles items={[
              { icon: Wallet, label: "Revenus perçus", value: euros(earnings), hint: "Net de commission" },
              { icon: Hourglass, label: "En attente", value: euros(pendingAmount), hint: `${pending.length} collabs en cours` },
              { icon: CheckCircle2, label: "Collabs terminées", value: released.length, hint: `${collabs.length} au total` },
              { icon: Percent, label: "Taux d'acceptation", value: `${acceptanceRate.toFixed(0)}%`, hint: `${acceptedProposals} / ${answered} réponses` },
            ]} />

            <div className="grid gap-4 lg:grid-cols-2">
              <MonthlyAreaChart
                title="Évolution des revenus"
                description="Les 6 derniers mois, net de commission"
                data={revenueData}
                series={[{ key: "revenue", label: "Revenus", color: "hsl(var(--primary))" }]}
                trendKey="revenue"
              />

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {perf.map(p => (
                    <div key={p.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{p.label}</span>
                        <span className="text-sm font-bold">{p.value}</span>
                      </div>
                      <Progress value={p.progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {proposals.filter(p => p.creator_status === "pending").length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune proposition pour le moment.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {proposals.filter(p => p.creator_status === "pending").map(p => p.campaigns && (
                  <Card key={p.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{p.campaigns.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {p.campaigns.description && <p className="text-sm text-muted-foreground">{p.campaigns.description}</p>}
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1"><Euro className="h-4 w-4 text-primary" /> {Math.round(Number(p.campaigns.budget_total) / Math.max(1, p.campaigns.creators_wanted))} € / créateur</span>
                        {p.campaigns.deadline && <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-primary" /> {new Date(p.campaigns.deadline).toLocaleDateString("fr-FR")}</span>}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1" onClick={() => decide(p.id, p.campaign_id, true)}>
                          <Check className="h-4 w-4 mr-1" /> Accepter
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => decide(p.id, p.campaign_id, false)}>
                          <X className="h-4 w-4 mr-1" /> Refuser
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {collabs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Mes collaborations</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {collabs.map(c => (
                    <Card key={c.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`/collab/${c.id}`)}>
                      <CardContent className="py-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{c.campaigns?.name}</p>
                          <p className="text-sm text-muted-foreground">{euros(net(c))} net</p>
                        </div>
                        <Badge>{c.status}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CreatorDashboard;
