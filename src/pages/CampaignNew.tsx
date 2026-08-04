import { useEffect, useMemo, useState } from "react";
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
import { Loader2, Rocket, Info } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type PricingRow = {
  id: string;
  network: string;
  audience_tier: string;
  format: string;
  price_min: number;
  price_recommended: number;
  reach_ratio_min: number;
  reach_ratio_max: number;
};

const NETWORK_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

const FORMAT_LABEL: Record<string, string> = {
  reel: "Reel",
  video: "Vidéo",
  integration: "Intégration",
  story: "Story",
  post: "Post",
};

const TIER_LABEL: Record<string, string> = {
  "1k_5k": "1 000 – 5 000 abonnés",
  "5k_10k": "5 000 – 10 000 abonnés",
  "10k_50k": "10 000 – 50 000 abonnés",
  "50k_100k": "50 000 – 100 000 abonnés",
  "100k_500k": "100 000 – 500 000 abonnés",
  "500k_1m": "500 000 – 1M abonnés",
  "1m_plus": "1M+ abonnés",
};

const TIER_MIN_AUDIENCE: Record<string, number> = {
  "1k_5k": 1000,
  "5k_10k": 5000,
  "10k_50k": 10000,
  "50k_100k": 50000,
  "100k_500k": 100000,
  "500k_1m": 500000,
  "1m_plus": 1000000,
};

const CampaignNew = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [commissionPct, setCommissionPct] = useState<number>(15);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [network, setNetwork] = useState<string>("");
  const [format, setFormat] = useState<string>("");
  const [audienceTier, setAudienceTier] = useState<string>("");
  const [creatorsWanted, setCreatorsWanted] = useState("3");
  const [nicheId, setNicheId] = useState<string>("");
  const [deadline, setDeadline] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);

      const [{ data: pricingRows }, { data: cats }, { data: settings }] = await Promise.all([
        supabase.from("pricing_config").select("*"),
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("platform_settings").select("setting_key, setting_value").eq("setting_key", "partnery_commission").maybeSingle(),
      ]);
      if (pricingRows) setPricing(pricingRows as PricingRow[]);
      if (cats) setCategories(cats);
      if (settings?.setting_value) setCommissionPct(Number(settings.setting_value));
    })();
  }, [navigate]);

  const networks = useMemo(
    () => Array.from(new Set(pricing.map((p) => p.network))),
    [pricing]
  );
  const formatsForNetwork = useMemo(
    () => Array.from(new Set(pricing.filter((p) => p.network === network).map((p) => p.format))),
    [pricing, network]
  );
  const tiersForSelection = useMemo(
    () =>
      Array.from(
        new Set(
          pricing
            .filter((p) => p.network === network && (!format || p.format === format))
            .map((p) => p.audience_tier)
        )
      ),
    [pricing, network, format]
  );

  const selectedRow = useMemo(
    () =>
      pricing.find(
        (p) =>
          p.network === network &&
          p.format === format &&
          p.audience_tier === audienceTier
      ),
    [pricing, network, format, audienceTier]
  );

  const nb = Math.max(parseInt(creatorsWanted || "0") || 0, 0);
  const pricePerCreator = selectedRow ? Number(selectedRow.price_recommended) : 0;
  const subtotal = pricePerCreator * nb;
  const commission = +(subtotal * (commissionPct / 100)).toFixed(2);
  const total = +(subtotal + commission).toFixed(2);
  const reachEst = selectedRow
    ? {
        min: Math.round(TIER_MIN_AUDIENCE[audienceTier] * (Number(selectedRow.reach_ratio_min) / 100)) * nb,
        max: Math.round(TIER_MIN_AUDIENCE[audienceTier] * (Number(selectedRow.reach_ratio_max) / 100)) * nb,
      }
    : null;

  const canLaunch = name && network && format && audienceTier && nb > 0 && selectedRow;

  const launch = async () => {
    if (!user || !canLaunch || !selectedRow) {
      toast.error("Complétez tous les champs obligatoires");
      return;
    }
    setLoading(true);
    try {
      const minAudience = TIER_MIN_AUDIENCE[audienceTier] || 0;

      const { data: campaign, error: cErr } = await supabase
        .from("campaigns")
        .insert({
          brand_id: user.id,
          name,
          description: brief || null,
          brand_brief: brief || null,
          budget_total: total,
          creators_wanted: nb,
          niche_category_id: nicheId || null,
          min_audience: minAudience,
          deadline: deadline || null,
          status: "matching",
          network,
          format,
          audience_tier: audienceTier,
          price_per_creator: pricePerCreator,
          commission_rate: commissionPct,
          commission_amount: commission,
        })
        .select()
        .single();
      if (cErr) throw cErr;

      // Matching officiel : créateurs vérifiés uniquement (fonction en base)
      const { data: inserted, error: mErr } = await supabase.rpc("generate_campaign_matches", {
        _campaign_id: campaign.id,
        _limit: nb * 3,
      });
      if (mErr) throw mErr;

      const count = Number(inserted || 0);
      if (count > 0) {
        toast.success(`Campagne créée — ${count} créateur(s) proposé(s) à valider`);
      } else {
        toast.success(
          "Campagne créée — aucun créateur vérifié ne correspond pour le moment, vous serez prévenu dès qu'un profil correspond"
        );
      }
      navigate(`/campaigns/${campaign.id}`);
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title="Nouvelle campagne | Partnery" description="Créez une campagne et laissez Partnery trouver les créateurs." />
      <Header user={user} />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nouvelle campagne</CardTitle>
            <p className="text-sm text-muted-foreground">
              Le budget se calcule automatiquement à partir des tarifs du marché.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Nom de la campagne *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Lancement collection été" />
            </div>

            <div>
              <Label>Brief pour les créateurs *</Label>
              <Textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={4}
                placeholder="Ce que la marque attend : ton, message clé, do & don't, deadline de publication…"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Réseau *</Label>
                <Select value={network} onValueChange={(v) => { setNetwork(v); setFormat(""); setAudienceTier(""); }}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {networks.map((n) => (
                      <SelectItem key={n} value={n}>{NETWORK_LABEL[n] || n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Format *</Label>
                <Select value={format} onValueChange={(v) => { setFormat(v); setAudienceTier(""); }} disabled={!network}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {formatsForNetwork.map((f) => (
                      <SelectItem key={f} value={f}>{FORMAT_LABEL[f] || f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Palier d'audience *</Label>
                <Select value={audienceTier} onValueChange={setAudienceTier} disabled={!format}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {tiersForSelection.map((t) => (
                      <SelectItem key={t} value={t}>{TIER_LABEL[t] || t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Nb créateurs *</Label>
                <Input type="number" min={1} value={creatorsWanted} onChange={(e) => setCreatorsWanted(e.target.value)} />
              </div>
              <div>
                <Label>Thématique (option)</Label>
                <Select value={nicheId} onValueChange={setNicheId}>
                  <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date limite (option)</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
            </div>

            {selectedRow && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Info className="h-4 w-4 text-primary" /> Estimation budget
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Tarif recommandé / créateur</span>
                  <span className="text-right font-medium">{pricePerCreator.toFixed(0)} €</span>
                  <span className="text-muted-foreground">Sous-total ({nb} créateur{nb > 1 ? "s" : ""})</span>
                  <span className="text-right font-medium">{subtotal.toFixed(0)} €</span>
                  <span className="text-muted-foreground">Commission Partnery ({commissionPct}%)</span>
                  <span className="text-right font-medium">{commission.toFixed(2)} €</span>
                  <span className="text-base font-semibold pt-2 border-t">Total à provisionner</span>
                  <span className="text-right text-base font-semibold pt-2 border-t">{total.toFixed(2)} €</span>
                </div>
                {reachEst && (
                  <p className="text-xs text-muted-foreground pt-2">
                    Reach estimé cumulé : {reachEst.min.toLocaleString("fr-FR")} – {reachEst.max.toLocaleString("fr-FR")} vues
                    <br />
                    Fourchette marché : {Number(selectedRow.price_min).toFixed(0)} € min · {pricePerCreator.toFixed(0)} € recommandé
                  </p>
                )}
              </div>
            )}

            <Button className="w-full" size="lg" onClick={launch} disabled={loading || !canLaunch}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Rocket className="h-4 w-4 mr-2" /> Lancer la campagne</>}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CampaignNew;
