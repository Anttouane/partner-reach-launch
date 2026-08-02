import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Shield, Save, Users, Briefcase, HandCoins, TrendingUp, Wallet, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSuperadmin } from "@/hooks/useSuperadmin";
import AdminAnalyticsTab from "@/components/dashboard/AdminAnalyticsTab";


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

const TIER_LABEL: Record<string, string> = {
  "1k_5k": "1k – 5k",
  "5k_10k": "5k – 10k",
  "10k_50k": "10k – 50k",
  "50k_100k": "50k – 100k",
};
const NETWORK_LABEL: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };

const Admin = () => {
  const navigate = useNavigate();
  const { isSuperadmin, loading: roleLoading } = useSuperadmin();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [pricingDraft, setPricingDraft] = useState<Record<string, Partial<PricingRow>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const [stats, setStats] = useState({
    brands: 0, creators: 0, campaigns: 0, activeCollabs: 0, totalGmv: 0, revenue: 0,
  });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      setAuthLoading(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (!roleLoading && !authLoading && !isSuperadmin) {
      toast.error("Accès réservé au superadmin");
      navigate("/");
    }
  }, [isSuperadmin, roleLoading, authLoading, navigate]);

  useEffect(() => {
    if (!isSuperadmin) return;
    (async () => {
      const [pc, ps, brands, creators, camps, collabs] = await Promise.all([
        supabase.from("pricing_config").select("*").order("network").order("audience_tier"),
        supabase.from("platform_settings").select("setting_key, setting_value"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("user_type", "brand"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("user_type", "creator"),
        supabase.from("campaigns").select("id", { count: "exact", head: true }),
        supabase.from("collabs").select("amount, commission, status"),
      ]);
      if (pc.data) setPricing(pc.data as PricingRow[]);
      if (ps.data) {
        const m: Record<string, string> = {};
        ps.data.forEach((r: any) => { m[r.setting_key] = r.setting_value; });
        setSettings(m); setSettingsDraft(m);
      }
      const collabRows = (collabs.data || []) as any[];
      setStats({
        brands: brands.count || 0,
        creators: creators.count || 0,
        campaigns: camps.count || 0,
        activeCollabs: collabRows.filter(c => ["escrowed","delivered"].includes(c.status)).length,
        totalGmv: collabRows.reduce((s, c) => s + Number(c.amount || 0), 0),
        revenue: collabRows.reduce((s, c) => s + Number(c.commission || 0), 0),
      });
    })();
  }, [isSuperadmin]);

  const grouped = useMemo(() => {
    const map: Record<string, PricingRow[]> = {};
    pricing.forEach(r => {
      const k = `${r.network}|${r.format}`;
      (map[k] ||= []).push(r);
    });
    return map;
  }, [pricing]);

  const setDraft = (id: string, patch: Partial<PricingRow>) =>
    setPricingDraft(d => ({ ...d, [id]: { ...d[id], ...patch } }));

  const saveRow = async (row: PricingRow) => {
    const patch = pricingDraft[row.id];
    if (!patch) return;
    setSavingId(row.id);
    const { error } = await supabase.from("pricing_config").update({
      price_min: Number(patch.price_min ?? row.price_min),
      price_recommended: Number(patch.price_recommended ?? row.price_recommended),
      reach_ratio_min: Number(patch.reach_ratio_min ?? row.reach_ratio_min),
      reach_ratio_max: Number(patch.reach_ratio_max ?? row.reach_ratio_max),
    }).eq("id", row.id);
    setSavingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Tarif mis à jour");
    setPricing(prev => prev.map(p => p.id === row.id ? { ...p, ...patch } as PricingRow : p));
    setPricingDraft(d => { const c = { ...d }; delete c[row.id]; return c; });
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    const entries = Object.entries(settingsDraft);
    for (const [key, value] of entries) {
      const { error } = await supabase.from("platform_settings").update({ setting_value: value }).eq("setting_key", key);
      if (error) { toast.error(`${key}: ${error.message}`); setSavingSettings(false); return; }
    }
    setSettings(settingsDraft);
    setSavingSettings(false);
    toast.success("Réglages enregistrés");
  };

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!isSuperadmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title="Superadmin | Partnery" description="Panel d'administration Partnery." />
      <Header user={user} />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Superadmin</h1>
            <p className="text-muted-foreground">Configuration en temps réel de Partnery</p>
          </div>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="verifications">Vérifications</TabsTrigger>
            <TabsTrigger value="pricing">Grille tarifaire</TabsTrigger>
            <TabsTrigger value="settings">Réglages</TabsTrigger>
          </TabsList>


          <TabsContent value="dashboard" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard icon={<Users className="h-5 w-5" />} label="Marques" value={stats.brands} />
              <StatCard icon={<Users className="h-5 w-5" />} label="Créateurs" value={stats.creators} />
              <StatCard icon={<Briefcase className="h-5 w-5" />} label="Campagnes" value={stats.campaigns} />
              <StatCard icon={<HandCoins className="h-5 w-5" />} label="Collabs actives" value={stats.activeCollabs} />
              <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Volume total" value={`${stats.totalGmv.toFixed(0)} €`} />
              <StatCard icon={<Wallet className="h-5 w-5" />} label="Revenus Partnery" value={`${stats.revenue.toFixed(0)} €`} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AdminAnalyticsTab />
          </TabsContent>

          <TabsContent value="verifications" className="mt-6">
            <VerificationsTab />
          </TabsContent>



          <TabsContent value="pricing" className="space-y-6 mt-6">
            {Object.entries(grouped).map(([key, rows]) => {
              const [network, format] = key.split("|");
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle>{NETWORK_LABEL[network]} — {format}</CardTitle>
                    <CardDescription>Modifier prix minimum, prix conseillé et ratio de reach par tranche.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tranche</TableHead>
                          <TableHead>Prix min (€)</TableHead>
                          <TableHead>Prix conseillé (€)</TableHead>
                          <TableHead>Reach min (%)</TableHead>
                          <TableHead>Reach max (%)</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map(row => {
                          const d = pricingDraft[row.id] || {};
                          const dirty = Object.keys(d).length > 0;
                          return (
                            <TableRow key={row.id}>
                              <TableCell className="font-medium">{TIER_LABEL[row.audience_tier]}</TableCell>
                              <TableCell><Input type="number" value={String(d.price_min ?? row.price_min)} onChange={e => setDraft(row.id, { price_min: Number(e.target.value) })} className="w-28" /></TableCell>
                              <TableCell><Input type="number" value={String(d.price_recommended ?? row.price_recommended)} onChange={e => setDraft(row.id, { price_recommended: Number(e.target.value) })} className="w-28" /></TableCell>
                              <TableCell><Input type="number" value={String(d.reach_ratio_min ?? row.reach_ratio_min)} onChange={e => setDraft(row.id, { reach_ratio_min: Number(e.target.value) })} className="w-24" /></TableCell>
                              <TableCell><Input type="number" value={String(d.reach_ratio_max ?? row.reach_ratio_max)} onChange={e => setDraft(row.id, { reach_ratio_max: Number(e.target.value) })} className="w-24" /></TableCell>
                              <TableCell>
                                <Button size="sm" disabled={!dirty || savingId === row.id} onClick={() => saveRow(row)}>
                                  {savingId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Réglages plateforme</CardTitle>
                <CardDescription>Appliqués en temps réel partout dans l'app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <SettingField label="Commission Partnery (%)" k="partnery_commission" settings={settingsDraft} setSettings={setSettingsDraft} />
                <SettingField label="Libération automatique après (jours)" k="auto_release_days" settings={settingsDraft} setSettings={setSettingsDraft} />
                <SettingField label="Délai de réponse créateur (heures)" k="creator_response_hours" settings={settingsDraft} setSettings={setSettingsDraft} />
                <Button onClick={saveSettings} disabled={savingSettings || JSON.stringify(settings) === JSON.stringify(settingsDraft)}>
                  {savingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Enregistrer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">{icon}<span className="text-sm">{label}</span></div>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const SettingField = ({ label, k, settings, setSettings }: { label: string; k: string; settings: Record<string, string>; setSettings: (fn: any) => void }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input type="number" value={settings[k] || ""} onChange={e => setSettings((s: any) => ({ ...s, [k]: e.target.value }))} />
  </div>
);

type PendingVerif = {
  id: string;
  creator_id: string;
  network: "instagram" | "tiktok" | "youtube";
  handle: string;
  profile_url: string;
  declared_followers: number;
  declared_avg_views: number | null;
  declared_engagement: number | null;
  screenshot_url: string | null;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  profile?: { full_name: string | null };
};

const VerificationsTab = () => {
  const [rows, setRows] = useState<PendingVerif[]>([]);
  const [filter, setFilter] = useState<"pending" | "verified" | "rejected">("pending");
  const [drafts, setDrafts] = useState<Record<string, { followers: string; avgViews: string; engagement: string; reason: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    const { data } = await (supabase as any)
      .from("social_verifications")
      .select("*, profile:profiles!social_verifications_creator_id_fkey(full_name)")
      .eq("status", filter)
      .order("submitted_at", { ascending: false });
    // fallback if FK join fails
    if (!data) {
      const { data: raw } = await (supabase as any).from("social_verifications").select("*").eq("status", filter).order("submitted_at", { ascending: false });
      setRows((raw as PendingVerif[]) || []);
    } else {
      setRows(data as PendingVerif[]);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const setDraft = (id: string, patch: Partial<{ followers: string; avgViews: string; engagement: string; reason: string }>) =>
    setDrafts(d => ({ ...d, [id]: { followers: "", avgViews: "", engagement: "", reason: "", ...d[id], ...patch } }));

  const approve = async (row: PendingVerif) => {
    const d = drafts[row.id] || { followers: "", avgViews: "", engagement: "", reason: "" };
    setSaving(row.id);
    const { error } = await (supabase as any).from("social_verifications").update({
      status: "verified",
      verified_followers: d.followers ? Number(d.followers) : row.declared_followers,
      verified_avg_views: d.avgViews ? Number(d.avgViews) : row.declared_avg_views,
      verified_engagement: d.engagement ? Number(d.engagement) : row.declared_engagement,
      verified_at: new Date().toISOString(),
      rejection_reason: null,
    }).eq("id", row.id);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Vérifié");
    load();
  };

  const reject = async (row: PendingVerif) => {
    const d = drafts[row.id];
    if (!d?.reason?.trim()) { toast.error("Ajoute une raison"); return; }
    setSaving(row.id);
    const { error } = await (supabase as any).from("social_verifications").update({
      status: "rejected",
      rejection_reason: d.reason.trim(),
    }).eq("id", row.id);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Refusé");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["pending", "verified", "rejected"] as const).map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}>
            {s === "pending" ? "En attente" : s === "verified" ? "Vérifiés" : "Refusés"}
          </Button>
        ))}
      </div>

      {rows.length === 0 && <p className="text-muted-foreground text-sm">Aucune demande.</p>}

      {rows.map(row => {
        const d = drafts[row.id] || { followers: "", avgViews: "", engagement: "", reason: "" };
        return (
          <Card key={row.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {row.profile?.full_name || "Créateur"} — <Badge variant="secondary" className="ml-1">{row.network}</Badge>
                  </CardTitle>
                  <CardDescription>
                    <a href={row.profile_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                      @{row.handle} <ExternalLink className="h-3 w-3" />
                    </a>
                    {" · "}Envoyé le {new Date(row.submitted_at).toLocaleDateString("fr-FR")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">Followers déclarés</span><div className="font-semibold">{row.declared_followers.toLocaleString("fr-FR")}</div></div>
                <div><span className="text-muted-foreground">Vues moy.</span><div className="font-semibold">{row.declared_avg_views?.toLocaleString("fr-FR") || "—"}</div></div>
                <div><span className="text-muted-foreground">Engagement</span><div className="font-semibold">{row.declared_engagement != null ? `${row.declared_engagement}%` : "—"}</div></div>
              </div>
              {row.screenshot_url && (
                <a href={row.screenshot_url} target="_blank" rel="noreferrer">
                  <img src={row.screenshot_url} alt="Capture" className="max-h-40 rounded-md border" />
                </a>
              )}
              {filter === "pending" && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Followers vérifiés</Label>
                      <Input type="number" placeholder={String(row.declared_followers)} value={d.followers} onChange={e => setDraft(row.id, { followers: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Vues moy. vérifiées</Label>
                      <Input type="number" placeholder={row.declared_avg_views?.toString() || ""} value={d.avgViews} onChange={e => setDraft(row.id, { avgViews: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Engagement vérifié</Label>
                      <Input type="number" step="0.1" placeholder={row.declared_engagement?.toString() || ""} value={d.engagement} onChange={e => setDraft(row.id, { engagement: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Raison (si refus)</Label>
                    <Textarea rows={2} value={d.reason} onChange={e => setDraft(row.id, { reason: e.target.value })} placeholder="Le compte déclaré ne correspond pas..." />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approve(row)} disabled={saving === row.id}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />Valider
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => reject(row)} disabled={saving === row.id}>
                      <XCircle className="h-4 w-4 mr-2" />Refuser
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Admin;

