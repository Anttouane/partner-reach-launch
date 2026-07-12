import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Check, X, Users, Euro, Calendar } from "lucide-react";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setUser(session.user);

    const { data: camp } = await supabase.from("campaigns").select("*").eq("id", id!).maybeSingle();
    setCampaign(camp);

    const { data: ms } = await supabase
      .from("campaign_matches")
      .select("*, profiles:creator_id(full_name, avatar_url, bio), creator_profiles:creator_id(audience_size, rate_per_collab, instagram_handle, tiktok_handle, youtube_handle)")
      .eq("campaign_id", id!)
      .order("match_score", { ascending: false });
    setMatches(ms || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const decide = async (matchId: string, approve: boolean) => {
    const { error } = await supabase
      .from("campaign_matches")
      .update({ brand_status: approve ? "approved" : "rejected" })
      .eq("id", matchId);
    if (error) { toast.error(error.message); return; }
    toast.success(approve ? "Créateur validé" : "Créateur écarté");
    load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!campaign) return <div className="min-h-screen"><Header user={user} /><p className="p-8 text-center">Campagne introuvable.</p></div>;

  const perCreator = Number(campaign.budget_total) / Math.max(1, campaign.creators_wanted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title={`${campaign.name} | Partnery`} description="Créateurs matchés pour votre campagne." />
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
            {campaign.description && <p className="text-muted-foreground">{campaign.description}</p>}
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1"><Euro className="h-4 w-4 text-primary" /> Budget : {campaign.budget_total} € ({perCreator.toFixed(0)} €/créateur)</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> {campaign.creators_wanted} créateurs voulus</span>
              {campaign.deadline && <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-primary" /> {new Date(campaign.deadline).toLocaleDateString()}</span>}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Créateurs matchés ({matches.length})</h2>
          {matches.some(m => m.brand_status === "pending") && (
            <Button onClick={() => navigate(`/campaigns/${id}/swipe`)}>Valider en mode swipe</Button>
          )}
        </div>
        {matches.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun créateur ne correspond pour l'instant.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {matches.map(m => (
              <Card key={m.id}>
                <CardContent className="py-4 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="font-semibold">{m.profiles?.full_name || "Créateur"}</p>
                    <p className="text-sm text-muted-foreground">
                      {m.creator_profiles?.audience_size ? `${m.creator_profiles.audience_size.toLocaleString()} followers` : "Audience non renseignée"}
                      {m.creator_profiles?.rate_per_collab && ` • Tarif : ${m.creator_profiles.rate_per_collab} €`}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">Marque : {m.brand_status}</Badge>
                      <Badge variant="outline">Créateur : {m.creator_status}</Badge>
                    </div>
                  </div>
                  {m.brand_status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => decide(m.id, true)}><Check className="h-4 w-4 mr-1" /> Valider</Button>
                      <Button size="sm" variant="outline" onClick={() => decide(m.id, false)}><X className="h-4 w-4 mr-1" /> Écarter</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CampaignDetail;
