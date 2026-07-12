import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Check, X, Instagram, Youtube, Music2, ShieldCheck, Users, TrendingUp, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Candidate = {
  match_id: string;
  creator_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  handle: string | null;
  profile_url: string | null;
  followers: number;
  avg_views: number | null;
  engagement: number | null;
  match_score: number;
};

const networkIcon = (n: string) => n === "instagram" ? Instagram : n === "youtube" ? Youtube : Music2;

const CampaignSwipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [queue, setQueue] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [decidingDir, setDecidingDir] = useState<"left" | "right" | null>(null);
  const [approvedCount, setApprovedCount] = useState(0);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setUser(session.user);

    const { data: camp } = await supabase.from("campaigns").select("*").eq("id", id!).maybeSingle();
    if (!camp || camp.brand_id !== session.user.id) {
      toast.error("Campagne introuvable");
      navigate("/dashboard");
      return;
    }
    setCampaign(camp);

    // Generate matches if none exist
    const { count } = await supabase.from("campaign_matches").select("id", { count: "exact", head: true }).eq("campaign_id", id!);
    if (!count || count === 0) {
      await supabase.rpc("generate_campaign_matches", { _campaign_id: id! });
    }

    await refreshQueue(session.user.id);
    setLoading(false);
  };

  const refreshQueue = async (_brandId: string) => {
    const { data: matches } = await supabase
      .from("campaign_matches")
      .select("id, creator_id, match_score, brand_status")
      .eq("campaign_id", id!)
      .eq("brand_status", "pending")
      .order("match_score", { ascending: false });

    if (!matches || matches.length === 0) { setQueue([]); return; }

    const creatorIds = matches.map(m => m.creator_id);
    const [{ data: profiles }, { data: verifs }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url, bio").in("id", creatorIds),
      supabase.from("social_verifications").select("creator_id, network, handle, profile_url, verified_followers, declared_followers, verified_avg_views, declared_avg_views, verified_engagement, declared_engagement, status").in("creator_id", creatorIds).eq("status", "verified"),
    ]);

    const { data: approved } = await supabase
      .from("campaign_matches")
      .select("id", { count: "exact" })
      .eq("campaign_id", id!)
      .eq("brand_status", "approved");
    setApprovedCount(approved?.length || 0);

    const network = campaign?.network || (await supabase.from("campaigns").select("network").eq("id", id!).maybeSingle()).data?.network;

    const items: Candidate[] = matches.map(m => {
      const p = profiles?.find(pp => pp.id === m.creator_id);
      const v = verifs?.find(vv => vv.creator_id === m.creator_id && vv.network === network);
      return {
        match_id: m.id,
        creator_id: m.creator_id,
        full_name: p?.full_name || null,
        avatar_url: p?.avatar_url || null,
        bio: p?.bio || null,
        handle: v?.handle || null,
        profile_url: v?.profile_url || null,
        followers: v?.verified_followers ?? v?.declared_followers ?? 0,
        avg_views: v?.verified_avg_views ?? v?.declared_avg_views ?? null,
        engagement: v?.verified_engagement ?? v?.declared_engagement ?? null,
        match_score: Number(m.match_score),
      };
    });
    setQueue(items);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const decide = async (approve: boolean) => {
    if (queue.length === 0 || decidingDir) return;
    const current = queue[0];
    setDecidingDir(approve ? "right" : "left");
    const { error } = await supabase
      .from("campaign_matches")
      .update({ brand_status: approve ? "approved" : "rejected" })
      .eq("id", current.match_id);
    if (error) { toast.error(error.message); setDecidingDir(null); return; }
    setTimeout(() => {
      setQueue(q => q.slice(1));
      if (approve) setApprovedCount(c => c + 1);
      setDecidingDir(null);
    }, 250);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const current = queue[0];
  const wanted = campaign?.creators_wanted || 0;
  const NetIcon = campaign ? networkIcon(campaign.network) : Instagram;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title={`Sélection créateurs | ${campaign?.name}`} description="Validez les créateurs matchés." />
      <Header user={user} />
      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="mb-4 flex items-center justify-between">
          <Link to={`/campaigns/${id}`} className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <Badge variant="secondary">{approvedCount}/{wanted} validés</Badge>
        </div>

        <h1 className="text-2xl font-bold mb-1">{campaign?.name}</h1>
        <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <NetIcon className="h-4 w-4" /> {campaign?.network} · {campaign?.audience_tier} · {campaign?.format}
        </p>

        <div className="relative h-[520px]">
          <AnimatePresence>
            {current ? (
              <motion.div
                key={current.match_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                exit={{
                  x: decidingDir === "right" ? 400 : decidingDir === "left" ? -400 : 0,
                  rotate: decidingDir === "right" ? 20 : decidingDir === "left" ? -20 : 0,
                  opacity: 0,
                }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <Card className="h-full overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/40 relative">
                    {current.avatar_url && (
                      <img src={current.avatar_url} alt={current.full_name || "Créateur"} className="absolute left-1/2 -bottom-12 -translate-x-1/2 h-24 w-24 rounded-full border-4 border-background object-cover" />
                    )}
                  </div>
                  <CardContent className="pt-16 text-center space-y-3">
                    <div>
                      <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                        {current.full_name || "Créateur"}
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </h2>
                      {current.handle && (
                        <a href={current.profile_url || "#"} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:underline">
                          @{current.handle}
                        </a>
                      )}
                    </div>
                    {current.bio && <p className="text-sm text-muted-foreground line-clamp-3">{current.bio}</p>}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="rounded-lg bg-secondary/40 py-2">
                        <p className="text-[10px] uppercase text-muted-foreground flex items-center justify-center gap-1"><Users className="h-3 w-3" /> Audience</p>
                        <p className="font-semibold">{current.followers.toLocaleString()}</p>
                      </div>
                      <div className="rounded-lg bg-secondary/40 py-2">
                        <p className="text-[10px] uppercase text-muted-foreground">Vues moy.</p>
                        <p className="font-semibold">{current.avg_views ? current.avg_views.toLocaleString() : "—"}</p>
                      </div>
                      <div className="rounded-lg bg-secondary/40 py-2">
                        <p className="text-[10px] uppercase text-muted-foreground flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3" /> Engag.</p>
                        <p className="font-semibold">{current.engagement ? `${Number(current.engagement).toFixed(1)}%` : "—"}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Badge variant="outline">Score de match : {Math.round(current.match_score)}/100</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Card className="w-full"><CardContent className="py-16 text-center space-y-3">
                  <p className="text-muted-foreground">Plus aucun créateur à valider.</p>
                  <Link to={`/campaigns/${id}`}><Button variant="outline">Retour à la campagne</Button></Link>
                </CardContent></Card>
              </div>
            )}
          </AnimatePresence>
        </div>

        {current && (
          <div className="flex justify-center gap-6 mt-6">
            <Button size="lg" variant="outline" className="h-16 w-16 rounded-full border-2" onClick={() => decide(false)} disabled={!!decidingDir}>
              <X className="h-7 w-7 text-destructive" />
            </Button>
            <Button size="lg" className="h-16 w-16 rounded-full" onClick={() => decide(true)} disabled={!!decidingDir}>
              <Check className="h-7 w-7" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CampaignSwipe;
