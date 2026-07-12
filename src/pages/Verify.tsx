import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, Clock, XCircle, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";

type Network = "instagram" | "tiktok" | "youtube";
type Status = "pending" | "verified" | "rejected";

type Verification = {
  id: string;
  creator_id: string;
  network: Network;
  handle: string;
  profile_url: string;
  declared_followers: number;
  declared_avg_views: number | null;
  declared_engagement: number | null;
  screenshot_url: string | null;
  status: Status;
  verified_followers: number | null;
  verified_avg_views: number | null;
  verified_engagement: number | null;
  rejection_reason: string | null;
  submitted_at: string;
};

const NETWORK_LABEL: Record<Network, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };
const URL_PREFIX: Record<Network, string> = {
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/@",
  youtube: "https://youtube.com/@",
};

const Verify = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Verification[]>([]);
  const [activeTab, setActiveTab] = useState<Network>("instagram");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      const { data } = await (supabase as any).from("social_verifications").select("*").eq("creator_id", session.user.id);
      setItems((data as Verification[]) || []);
      setLoading(false);
    })();
  }, [navigate]);

  const getFor = (n: Network) => items.find(i => i.network === n);

  const refresh = async () => {
    if (!user) return;
    const { data } = await (supabase as any).from("social_verifications").select("*").eq("creator_id", user.id);
    setItems((data as Verification[]) || []);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title="Vérification | Partnery" description="Faites vérifier vos comptes sociaux pour augmenter votre visibilité auprès des marques." />
      <Header user={user} />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Vérification de vos comptes</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Ajoutez vos comptes sociaux. Un badge « vérifié » sera visible auprès des marques une fois validé par notre équipe (sous 48h).
        </p>

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as Network)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="instagram">Instagram <StatusDot v={getFor("instagram")} /></TabsTrigger>
            <TabsTrigger value="tiktok">TikTok <StatusDot v={getFor("tiktok")} /></TabsTrigger>
            <TabsTrigger value="youtube">YouTube <StatusDot v={getFor("youtube")} /></TabsTrigger>
          </TabsList>

          {(["instagram", "tiktok", "youtube"] as Network[]).map(n => (
            <TabsContent key={n} value={n} className="mt-6">
              <NetworkForm
                network={n}
                userId={user!.id}
                existing={getFor(n)}
                onSaved={refresh}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

const StatusDot = ({ v }: { v?: Verification }) => {
  if (!v) return null;
  const cls = v.status === "verified" ? "bg-green-500" : v.status === "pending" ? "bg-amber-500" : "bg-red-500";
  return <span className={`ml-2 h-2 w-2 rounded-full ${cls}`} />;
};

const NetworkForm = ({ network, userId, existing, onSaved }: { network: Network; userId: string; existing?: Verification; onSaved: () => void }) => {
  const readOnly = existing?.status === "verified" || existing?.status === "pending";
  const [handle, setHandle] = useState(existing?.handle || "");
  const [followers, setFollowers] = useState(existing?.declared_followers?.toString() || "");
  const [avgViews, setAvgViews] = useState(existing?.declared_avg_views?.toString() || "");
  const [engagement, setEngagement] = useState(existing?.declared_engagement?.toString() || "");
  const [screenshotUrl, setScreenshotUrl] = useState<string>(existing?.screenshot_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const uploadScreenshot = async (file: File) => {
    setUploading(true);
    const path = `${userId}/${network}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    setScreenshotUrl(data.publicUrl);
    setUploading(false);
    toast.success("Capture ajoutée");
  };

  const save = async () => {
    const cleanHandle = handle.replace(/^@/, "").trim();
    if (!cleanHandle) { toast.error("Renseigne ton pseudo"); return; }
    const f = Number(followers);
    if (!f || f < 0) { toast.error("Nombre de followers invalide"); return; }
    setSaving(true);
    const payload = {
      creator_id: userId,
      network,
      handle: cleanHandle,
      profile_url: URL_PREFIX[network] + cleanHandle,
      declared_followers: f,
      declared_avg_views: avgViews ? Number(avgViews) : null,
      declared_engagement: engagement ? Number(engagement) : null,
      screenshot_url: screenshotUrl || null,
      status: "pending" as const,
      rejection_reason: null,
    };
    const { error } = existing
      ? await (supabase as any).from("social_verifications").update(payload).eq("id", existing.id)
      : await (supabase as any).from("social_verifications").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Demande envoyée. Notre équipe vérifie sous 48h.");
    onSaved();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{NETWORK_LABEL[network]}</CardTitle>
            <CardDescription>Renseigne ton pseudo et tes statistiques déclarées.</CardDescription>
          </div>
          {existing && <StatusBadge status={existing.status} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {existing?.status === "rejected" && existing.rejection_reason && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            <strong>Refusé :</strong> {existing.rejection_reason}
          </div>
        )}
        {existing?.status === "verified" && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 text-sm text-green-700 space-y-1">
            <div><strong>Followers vérifiés :</strong> {existing.verified_followers?.toLocaleString("fr-FR")}</div>
            {existing.verified_avg_views !== null && <div><strong>Vues moyennes :</strong> {existing.verified_avg_views?.toLocaleString("fr-FR")}</div>}
            {existing.verified_engagement !== null && <div><strong>Engagement :</strong> {existing.verified_engagement}%</div>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pseudo (sans @)</Label>
            <Input value={handle} onChange={e => setHandle(e.target.value)} placeholder="monpseudo" disabled={readOnly} />
          </div>
          <div className="space-y-2">
            <Label>Followers / Abonnés</Label>
            <Input type="number" value={followers} onChange={e => setFollowers(e.target.value)} placeholder="15000" disabled={readOnly} />
          </div>
          <div className="space-y-2">
            <Label>Vues moyennes par post (optionnel)</Label>
            <Input type="number" value={avgViews} onChange={e => setAvgViews(e.target.value)} placeholder="4500" disabled={readOnly} />
          </div>
          <div className="space-y-2">
            <Label>Taux d'engagement % (optionnel)</Label>
            <Input type="number" step="0.1" value={engagement} onChange={e => setEngagement(e.target.value)} placeholder="3.5" disabled={readOnly} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Capture d'écran de vos statistiques (recommandé)</Label>
          {screenshotUrl && <img src={screenshotUrl} alt="Capture stats" className="max-h-48 rounded-md border" />}
          {!readOnly && (
            <div>
              <input type="file" accept="image/*" id={`shot-${network}`} className="hidden"
                onChange={e => e.target.files?.[0] && uploadScreenshot(e.target.files[0])} />
              <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                <label htmlFor={`shot-${network}`} className="cursor-pointer">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {screenshotUrl ? "Remplacer" : "Ajouter une capture"}
                </label>
              </Button>
            </div>
          )}
        </div>

        {!readOnly && (
          <Button onClick={save} disabled={saving} className="w-full">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {existing ? "Renvoyer la demande" : "Envoyer pour vérification"}
          </Button>
        )}
        {existing?.status === "pending" && (
          <p className="text-sm text-muted-foreground text-center">Demande en cours de traitement. Réponse sous 48h.</p>
        )}
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: Status }) => {
  if (status === "verified") return <Badge className="bg-green-500 hover:bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Vérifié</Badge>;
  if (status === "pending") return <Badge className="bg-amber-500 hover:bg-amber-500"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
  return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Refusé</Badge>;
};

export default Verify;
