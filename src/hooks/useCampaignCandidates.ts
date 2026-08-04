import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Verification = {
  network: string;
  handle: string;
  profile_url: string;
  followers: number;
  avg_views: number | null;
  engagement: number | null;
};

export type Candidate = {
  match_id: string;
  creator_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  match_score: number;
  brand_status: string;
  creator_status: string;
  rate_per_collab: number | null;
  category_name: string | null;
  verifications: Verification[];
  main: Verification | null;
  completed_collabs: number;
};

export const useCampaignCandidates = (campaignId?: string, network?: string) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!campaignId) return;
    const { data: matches } = await supabase
      .from("campaign_matches")
      .select("id, creator_id, match_score, brand_status, creator_status")
      .eq("campaign_id", campaignId)
      .order("match_score", { ascending: false });

    if (!matches || matches.length === 0) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    const creatorIds = matches.map((m) => m.creator_id);
    const [{ data: profiles }, { data: verifs }, { data: creatorProfiles }, { data: collabs }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url, bio, categories:category_id(name)")
          .in("id", creatorIds),
        supabase
          .from("social_verifications")
          .select(
            "creator_id, network, handle, profile_url, verified_followers, declared_followers, verified_avg_views, declared_avg_views, verified_engagement, declared_engagement"
          )
          .in("creator_id", creatorIds)
          .eq("status", "verified"),
        supabase.from("creator_profiles").select("id, rate_per_collab").in("id", creatorIds),
        supabase.from("collabs").select("creator_id, status").in("creator_id", creatorIds),
      ]);

    const items: Candidate[] = matches.map((m) => {
      const p: any = profiles?.find((pp) => pp.id === m.creator_id);
      const cp = creatorProfiles?.find((c) => c.id === m.creator_id);
      const vs: Verification[] = (verifs || [])
        .filter((v) => v.creator_id === m.creator_id)
        .map((v) => ({
          network: v.network as string,
          handle: v.handle,
          profile_url: v.profile_url,
          followers: v.verified_followers ?? v.declared_followers ?? 0,
          avg_views: v.verified_avg_views ?? v.declared_avg_views ?? null,
          engagement: v.verified_engagement !== null && v.verified_engagement !== undefined
            ? Number(v.verified_engagement)
            : v.declared_engagement !== null && v.declared_engagement !== undefined
            ? Number(v.declared_engagement)
            : null,
        }));

      return {
        match_id: m.id,
        creator_id: m.creator_id,
        full_name: p?.full_name ?? null,
        avatar_url: p?.avatar_url ?? null,
        bio: p?.bio ?? null,
        match_score: Number(m.match_score),
        brand_status: m.brand_status,
        creator_status: m.creator_status,
        rate_per_collab: cp?.rate_per_collab != null ? Number(cp.rate_per_collab) : null,
        category_name: p?.categories?.name ?? null,
        verifications: vs,
        main: vs.find((v) => v.network === network) || vs[0] || null,
        completed_collabs: (collabs || []).filter(
          (c) => c.creator_id === m.creator_id && c.status === "released"
        ).length,
      };
    });

    setCandidates(items);
    setLoading(false);
  }, [campaignId, network]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const decide = async (matchId: string, approve: boolean) => {
    const { error } = await supabase
      .from("campaign_matches")
      .update({ brand_status: approve ? "approved" : "rejected" })
      .eq("id", matchId);
    if (error) {
      toast.error(error.message);
      return false;
    }
    setCandidates((cs) =>
      cs.map((c) =>
        c.match_id === matchId ? { ...c, brand_status: approve ? "approved" : "rejected" } : c
      )
    );
    toast.success(approve ? "Créateur validé" : "Créateur écarté");
    return true;
  };

  return { candidates, loading, refresh, decide };
};
