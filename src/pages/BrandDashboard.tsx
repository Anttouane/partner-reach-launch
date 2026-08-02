import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { PlusCircle, Users, CheckCircle2, Loader2, Megaphone, Wallet, Percent } from "lucide-react";

interface CampaignRow {
  id: string;
  name: string;
  status: string;
  budget_total: number;
  creators_wanted: number;
  matched: number;
  approved: number;
  accepted: number;
  paid: number;
  delivered: number;
}

interface CollabRow {
  id: string;
  campaign_id: string;
  status: string;
  amount: number;
  created_at: string;
}

const statusLabel: Record<string, string> = {
  draft: "Brouillon", matching: "En cours", active: "Active", completed: "Terminée", cancelled: "Annulée",
};

const PAID_STATUSES = ["escrowed", "delivered", "released"];

const BrandDashboard = ({ user }: { user: User }) => {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [collabs, setCollabs] = useState<CollabRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: camps } = await supabase
        .from("campaigns")
        .select("id, name, status, budget_total, creators_wanted")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false });

      if (!camps || camps.length === 0) { setCampaigns([]); setCollabs([]); setLoading(false); return; }

      const ids = camps.map(c => c.id);

      const [{ data: matches }, { data: co }] = await Promise.all([
        supabase.from("campaign_matches").select("campaign_id, brand_status, creator_status").in("campaign_id", ids),
        supabase.from("collabs").select("id, campaign_id, status, amount, created_at").in("campaign_id", ids),
      ]);

      const rows: CampaignRow[] = camps.map(c => {
        const m = (matches || []).filter(x => x.campaign_id === c.id);
        const cc = (co || []).filter(x => x.campaign_id === c.id);
        return {
          ...c,
          budget_total: Number(c.budget_total),
          matched: m.length,
          approved: m.filter(x => x.brand_status === "approved").length,
          accepted: m.filter(x => x.creator_status === "accepted").length,
          paid: cc.filter(x => PAID_STATUSES.includes(x.status)).length,
          delivered: cc.filter(x => ["delivered", "released"].includes(x.status)).length,
        };
      });

      setCampaigns(rows);
      setCollabs(((co || []) as any[]).map(x => ({ ...x, amount: Number(x.amount) })));
      setLoading(false);
    })();
  }, [user.id]);

  const paidCollabs = collabs.filter(c => PAID_STATUSES.includes(c.status));
  const activeCampaigns = campaigns.filter(c => ["matching", "active"].includes(c.status)).length;
  const creatorsInCollab = collabs.filter(c => ["escrowed", "delivered"].includes(c.status)).length;
  const engaged = paidCollabs.reduce((s, c) => s + c.amount, 0);
  const totalApproved = campaigns.reduce((s, c) => s + c.approved, 0);
  const totalAccepted = campaigns.reduce((s, c) => s + c.accepted, 0);
  const acceptanceRate = totalApproved > 0 ? (totalAccepted / totalApproved) * 100 : 0;

  const spendingData = monthlySeries(
    paidCollabs,
    c => c.created_at,
    { spending: c => c.amount },
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title="Dashboard marque | Partnery" description="Vos campagnes, vos créateurs et vos performances." />
      <Header user={user} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mes campagnes</h1>
            <p className="text-muted-foreground">Créez une campagne, laissez Partnery trouver les créateurs.</p>
          </div>
          <Link to="/campaigns/new">
            <Button size="lg"><PlusCircle className="h-4 w-4 mr-2" /> Créer une campagne</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <KpiTiles items={[
              { icon: Megaphone, label: "Campagnes actives", value: activeCampaigns, hint: `${campaigns.length} au total` },
              { icon: Users, label: "Créateurs en collab", value: creatorsInCollab, hint: "Paiement séquestré ou livré" },
              { icon: Wallet, label: "Budget engagé", value: euros(engaged), hint: `${paidCollabs.length} collabs payées` },
              { icon: Percent, label: "Taux d'acceptation", value: `${acceptanceRate.toFixed(0)}%`, hint: `${totalAccepted} / ${totalApproved} créateurs validés` },
            ]} />

            <div className="grid gap-4 lg:grid-cols-2">
              <MonthlyAreaChart
                title="Évolution des dépenses"
                description={`Total : ${euros(engaged)} sur 6 mois`}
                data={spendingData}
                series={[{ key: "spending", label: "Dépenses", color: "hsl(var(--secondary))" }]}
                trendKey="spending"
              />

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Entonnoir par campagne</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaigns.length === 0 && <p className="text-sm text-muted-foreground">Aucune campagne pour l'instant.</p>}
                  {campaigns.slice(0, 4).map(c => {
                    const base = Math.max(1, c.matched);
                    const steps = [
                      { label: "Matchés", v: c.matched },
                      { label: "Validés", v: c.approved },
                      { label: "Acceptés", v: c.accepted },
                      { label: "Payés", v: c.paid },
                      { label: "Livrés", v: c.delivered },
                    ];
                    return (
                      <div key={c.id} className="space-y-2">
                        <p className="text-sm font-medium">{c.name}</p>
                        {steps.map(s => (
                          <div key={s.label} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-16">{s.label}</span>
                            <Progress value={(s.v / base) * 100} className="h-2 flex-1" />
                            <span className="text-xs font-semibold w-6 text-right">{s.v}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">Aucune campagne pour l'instant.</p>
                  <Link to="/campaigns/new"><Button><PlusCircle className="h-4 w-4 mr-2" /> Créer ma première campagne</Button></Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {campaigns.map(c => (
                  <Link key={c.id} to={`/campaigns/${c.id}`}>
                    <Card className="hover:shadow-md transition cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg">{c.name}</CardTitle>
                          <Badge variant="secondary">{statusLabel[c.status]}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p className="text-muted-foreground">Budget total : <span className="font-semibold text-foreground">{euros(c.budget_total)}</span></p>
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> {c.matched} matchés / {c.creators_wanted}</span>
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> {c.accepted} acceptés</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default BrandDashboard;
