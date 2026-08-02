import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import MonthlyAreaChart from "@/components/dashboard/MonthlyAreaChart";
import { monthlySeries, euros } from "@/hooks/useDashboardAnalytics";

interface Collab {
  id: string;
  campaign_id: string;
  creator_id: string;
  status: string;
  amount: number;
  commission: number;
  created_at: string;
}

interface Campaign {
  id: string;
  brand_id: string;
  network: string | null;
  created_at: string;
}

const NETWORK_LABEL: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };
const STATUS_LABEL: Record<string, string> = {
  awaiting_payment: "En attente de paiement",
  escrowed: "Fonds séquestrés",
  delivered: "Livrée",
  released: "Payée",
  cancelled: "Annulée",
  disputed: "En litige",
};

const AdminAnalyticsTab = () => {
  const [loading, setLoading] = useState(true);
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const [{ data: co }, { data: camps }, { data: profs }] = await Promise.all([
        supabase.from("collabs").select("id, campaign_id, creator_id, status, amount, commission, created_at"),
        supabase.from("campaigns").select("id, brand_id, network, created_at"),
        supabase.from("profiles").select("id, full_name"),
      ]);
      setCollabs(((co || []) as any[]).map(c => ({ ...c, amount: Number(c.amount), commission: Number(c.commission || 0) })));
      setCampaigns((camps || []) as any);
      setNames(Object.fromEntries(((profs || []) as any[]).map(p => [p.id, p.full_name || "—"])));
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const paid = collabs.filter(c => ["escrowed", "delivered", "released"].includes(c.status));
  const gmvData = monthlySeries(
    paid,
    c => c.created_at,
    { gmv: c => c.amount, revenue: c => c.commission },
  );

  const byStatus = Object.entries(
    collabs.reduce<Record<string, number>>((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const byNetwork = Object.entries(
    campaigns.reduce<Record<string, number>>((acc, c) => {
      const k = c.network || "non défini";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const campaignBrand = Object.fromEntries(campaigns.map(c => [c.id, c.brand_id]));
  const brandVolume: Record<string, number> = {};
  const creatorRevenue: Record<string, number> = {};
  paid.forEach(c => {
    const b = campaignBrand[c.campaign_id];
    if (b) brandVolume[b] = (brandVolume[b] || 0) + c.amount;
    creatorRevenue[c.creator_id] = (creatorRevenue[c.creator_id] || 0) + (c.amount - c.commission);
  });
  const topBrands = Object.entries(brandVolume).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topCreators = Object.entries(creatorRevenue).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const conversion = campaigns.length > 0 ? (paid.length / campaigns.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <MonthlyAreaChart
        title="Volume et revenus Partnery"
        description={`GMV cumulé : ${euros(paid.reduce((s, c) => s + c.amount, 0))} · Revenus : ${euros(paid.reduce((s, c) => s + c.commission, 0))}`}
        data={gmvData}
        series={[
          { key: "gmv", label: "Volume", color: "hsl(var(--primary))" },
          { key: "revenue", label: "Revenus", color: "hsl(var(--secondary))" },
        ]}
        trendKey="gmv"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Collabs par statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {byStatus.length === 0 && <p className="text-sm text-muted-foreground">Aucune collab.</p>}
            {byStatus.map(([s, n]) => (
              <div key={s} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{STATUS_LABEL[s] || s}</span>
                  <span className="font-semibold">{n}</span>
                </div>
                <Progress value={(n / Math.max(1, collabs.length)) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Campagnes par réseau</CardTitle>
            <CardDescription>Taux de conversion global : {conversion.toFixed(0)}% (campagnes → collabs payées)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {byNetwork.length === 0 && <p className="text-sm text-muted-foreground">Aucune campagne.</p>}
            {byNetwork.map(([n, count]) => (
              <div key={n} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{NETWORK_LABEL[n] || n}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <Progress value={(count / Math.max(1, campaigns.length)) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Top marques (volume)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2 text-sm">
            {topBrands.length === 0 && <p className="text-muted-foreground">Pas encore de volume.</p>}
            {topBrands.map(([id, v]) => (
              <div key={id} className="flex justify-between">
                <span>{names[id] || "Marque"}</span>
                <span className="font-semibold">{euros(v)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Top créateurs (revenus nets)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2 text-sm">
            {topCreators.length === 0 && <p className="text-muted-foreground">Pas encore de revenus.</p>}
            {topCreators.map(([id, v]) => (
              <div key={id} className="flex justify-between">
                <span>{names[id] || "Créateur"}</span>
                <span className="font-semibold">{euros(v)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsTab;
