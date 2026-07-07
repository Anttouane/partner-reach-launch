import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Loader2, Calendar, Euro } from "lucide-react";

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

const CreatorDashboard = ({ user }: { user: User }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [collabs, setCollabs] = useState<any[]>([]);
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
      .select("id, status, amount, campaigns(name)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });
    setCollabs(co || []);
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
      // fetch campaign
      const { data: camp } = await supabase.from("campaigns").select("budget_total, creators_wanted").eq("id", campaignId).maybeSingle();
      if (camp) {
        const amount = Number(camp.budget_total) / Math.max(1, camp.creators_wanted);
        const commission = amount * 0.05;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title="Dashboard créateur | Partnery" description="Vos propositions de campagnes matchées." />
      <Header user={user} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Propositions pour vous</h1>
          <p className="text-muted-foreground">Ces campagnes correspondent à votre profil. Acceptez en un clic.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : proposals.filter(p => p.creator_status === "pending").length === 0 ? (
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
                    {p.campaigns.deadline && <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-primary" /> {new Date(p.campaigns.deadline).toLocaleDateString()}</span>}
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
              {collabs.map((c: any) => (
                <Card key={c.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`/collab/${c.id}`)}>
                  <CardContent className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{c.campaigns?.name}</p>
                      <p className="text-sm text-muted-foreground">{Number(c.amount).toFixed(2)} €</p>
                    </div>
                    <Badge>{c.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatorDashboard;
