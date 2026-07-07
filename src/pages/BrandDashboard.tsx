import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, CheckCircle2, Loader2 } from "lucide-react";

interface CampaignRow {
  id: string;
  name: string;
  status: string;
  budget_total: number;
  creators_wanted: number;
  matched: number;
  accepted: number;
}

const statusLabel: Record<string, string> = {
  draft: "Brouillon", matching: "En cours", active: "Active", completed: "Terminée", cancelled: "Annulée",
};

const BrandDashboard = ({ user }: { user: User }) => {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: camps } = await supabase
        .from("campaigns")
        .select("id, name, status, budget_total, creators_wanted")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false });

      if (!camps) { setCampaigns([]); setLoading(false); return; }

      const rows: CampaignRow[] = await Promise.all(camps.map(async (c) => {
        const { data: matches } = await supabase
          .from("campaign_matches")
          .select("creator_status")
          .eq("campaign_id", c.id);
        const matched = matches?.length || 0;
        const accepted = matches?.filter(m => m.creator_status === "accepted").length || 0;
        return { ...c, budget_total: Number(c.budget_total), matched, accepted };
      }));
      setCampaigns(rows);
      setLoading(false);
    })();
  }, [user.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title="Dashboard marque | Partnery" description="Vos campagnes et créateurs matchés." />
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
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
        ) : campaigns.length === 0 ? (
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
                    <p className="text-muted-foreground">Budget total : <span className="font-semibold text-foreground">{c.budget_total} €</span></p>
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
      </main>
    </div>
  );
};

export default BrandDashboard;
