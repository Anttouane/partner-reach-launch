import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Rocket } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const CampaignNew = () => {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [creatorsWanted, setCreatorsWanted] = useState("3");
  const [nicheId, setNicheId] = useState("");
  const [minAudience, setMinAudience] = useState("0");
  const [deadline, setDeadline] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      const { data } = await supabase.from("categories").select("id, name").order("name");
      if (data) setCategories(data);
    })();
  }, [navigate]);

  const launch = async () => {
    if (!user) return;
    if (!name || !budget || !creatorsWanted || !nicheId) {
      toast.error("Remplissez les champs obligatoires");
      return;
    }
    setLoading(true);
    try {
      const budgetNum = parseFloat(budget);
      const wanted = parseInt(creatorsWanted);
      const perCreator = budgetNum / wanted;

      const { data: campaign, error: cErr } = await supabase.from("campaigns").insert({
        brand_id: user.id,
        name,
        description: description || null,
        budget_total: budgetNum,
        creators_wanted: wanted,
        niche_category_id: nicheId,
        min_audience: parseInt(minAudience) || 0,
        deadline: deadline || null,
        status: "matching",
      }).select().single();
      if (cErr) throw cErr;

      // Matching client-side : chercher créateurs qui matchent
      const { data: creatorProfs } = await supabase
        .from("creator_profiles")
        .select("id, audience_size, rate_per_collab, profiles!inner(id, category_id, full_name)")
        .gte("audience_size", parseInt(minAudience) || 0)
        .lte("rate_per_collab", perCreator);

      const candidates = (creatorProfs || []).filter((c: any) => c.profiles?.category_id === nicheId);

      // top N = wanted * 3
      const scored = candidates.map((c: any) => ({
        creator_id: c.id,
        score: (Number(c.audience_size || 0) / 1000) - Math.abs(perCreator - Number(c.rate_per_collab || 0)) / 100,
      })).sort((a, b) => b.score - a.score).slice(0, wanted * 3);

      if (scored.length > 0) {
        await supabase.from("campaign_matches").insert(
          scored.map(s => ({
            campaign_id: campaign.id,
            creator_id: s.creator_id,
            match_score: Math.max(0, s.score),
          }))
        );
      }

      toast.success(`Campagne lancée — ${scored.length} créateur(s) matché(s)`);
      navigate(`/campaigns/${campaign.id}`);
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title="Nouvelle campagne | Partnery" description="Créez une campagne, Partnery trouve les créateurs." />
      <Header user={user} />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nouvelle campagne</CardTitle>
            <p className="text-sm text-muted-foreground">Définissez vos critères, on trouve les créateurs.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Nom de la campagne *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Description courte</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Budget total (€) *</Label><Input type="number" value={budget} onChange={e => setBudget(e.target.value)} /></div>
              <div><Label>Nb créateurs voulus *</Label><Input type="number" value={creatorsWanted} onChange={e => setCreatorsWanted(e.target.value)} /></div>
            </div>
            <div><Label>Niche ciblée *</Label>
              <Select value={nicheId} onValueChange={setNicheId}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Audience min</Label><Input type="number" value={minAudience} onChange={e => setMinAudience(e.target.value)} /></div>
              <div><Label>Date limite</Label><Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
            </div>
            {budget && creatorsWanted && (
              <p className="text-sm text-muted-foreground">≈ {(parseFloat(budget) / parseInt(creatorsWanted || "1")).toFixed(0)} € par créateur (commission 5% incluse au paiement).</p>
            )}
            <Button className="w-full" size="lg" onClick={launch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Rocket className="h-4 w-4 mr-2" /> Lancer la campagne</>}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CampaignNew;
