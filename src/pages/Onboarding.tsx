import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ArrowRight, Sparkles, Building2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";

type Role = "brand" | "creator";
interface Category { id: string; name: string }

const Onboarding = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Common
  const [fullName, setFullName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Creator
  const [audienceSize, setAudienceSize] = useState("");
  const [ratePerCollab, setRatePerCollab] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");

  // Brand
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);
      const { data: prof } = await supabase.from("profiles").select("user_type, full_name").eq("id", session.user.id).maybeSingle();
      if (prof?.user_type) setRole(prof.user_type as Role);
      if (prof?.full_name) setFullName(prof.full_name);
      const { data: cats } = await supabase.from("categories").select("id, name").order("name");
      if (cats) setCategories(cats);
    })();
  }, [navigate]);

  const submit = async () => {
    if (!userId || !role) return;
    setLoading(true);
    try {
      const { error: pErr } = await supabase.from("profiles").update({
        user_type: role,
        full_name: fullName,
        category_id: categoryId || null,
        bio: role === "brand" ? bio : `Créateur ${role}`,
      }).eq("id", userId);
      if (pErr) throw pErr;

      if (role === "creator") {
        const { error } = await supabase.from("creator_profiles").upsert({
          id: userId,
          audience_size: audienceSize ? parseInt(audienceSize) : null,
          rate_per_collab: ratePerCollab ? parseFloat(ratePerCollab) : null,
          instagram_handle: instagram || null,
          tiktok_handle: tiktok || null,
          youtube_handle: youtube || null,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("brand_profiles").upsert({
          id: userId,
          company_name: companyName,
          industry,
          website: website || null,
        });
        if (error) throw error;
      }

      toast.success("Profil complété !");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <SEOHead title="Bienvenue sur Partnery" description="Complétez votre profil pour commencer." />
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Bienvenue sur Partnery</CardTitle>
          <p className="text-sm text-muted-foreground">Étape {step} sur 3</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Vous êtes :</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("brand")}
                  className={`p-6 rounded-lg border-2 transition ${role === "brand" ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Marque</p>
                  <p className="text-xs text-muted-foreground">Je cherche des créateurs</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("creator")}
                  className={`p-6 rounded-lg border-2 transition ${role === "creator" ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Créateur</p>
                  <p className="text-xs text-muted-foreground">Je crée du contenu</p>
                </button>
              </div>
              <Button className="w-full" disabled={!role} onClick={() => setStep(2)}>
                Continuer <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && role === "creator" && (
            <div className="space-y-3">
              <div><Label>Nom complet</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
              <div><Label>Niche</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Taille d'audience totale</Label><Input type="number" value={audienceSize} onChange={e => setAudienceSize(e.target.value)} placeholder="Ex: 25000" /></div>
              <div><Label>Tarif par collab (€)</Label><Input type="number" value={ratePerCollab} onChange={e => setRatePerCollab(e.target.value)} placeholder="Ex: 500" /></div>
              <Button className="w-full" onClick={() => setStep(3)} disabled={!fullName || !categoryId || !audienceSize || !ratePerCollab}>
                Continuer <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && role === "brand" && (
            <div className="space-y-3">
              <div><Label>Nom complet</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
              <div><Label>Nom de l'entreprise</Label><Input value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
              <div><Label>Secteur</Label><Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Mode, Tech, Food..." /></div>
              <div><Label>Niche ciblée</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => setStep(3)} disabled={!fullName || !companyName || !industry}>
                Continuer <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 3 && role === "creator" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Renseignez au moins un réseau social.</p>
              <div><Label>Instagram</Label><Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@handle" /></div>
              <div><Label>TikTok</Label><Input value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@handle" /></div>
              <div><Label>YouTube</Label><Input value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="chaîne" /></div>
              <Button className="w-full" onClick={submit} disabled={loading || (!instagram && !tiktok && !youtube)}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terminer"}
              </Button>
            </div>
          )}

          {step === 3 && role === "brand" && (
            <div className="space-y-3">
              <div><Label>Site web</Label><Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." /></div>
              <div><Label>Description courte</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} /></div>
              <Button className="w-full" onClick={submit} disabled={loading || !bio}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terminer"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
