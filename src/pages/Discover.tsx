import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Briefcase, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PitchCard from "@/components/discover/PitchCard";
import OpportunityCard from "@/components/discover/OpportunityCard";
import ProfileCard from "@/components/discover/ProfileCard";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Discover = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pitches, setPitches] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await Promise.all([loadCategories(), loadData(session.user)]);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    if (data) setCategories(data);
  };

  const loadData = async (currentUser: User) => {
    const userType = currentUser.user_metadata?.user_type || "creator";

    if (userType === "brand") {
      const [pitchesRes, profilesRes] = await Promise.all([
        supabase
          .from("pitches")
          .select("*, profiles:creator_id (full_name, bio, avatar_url, category_id)")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("*, creator_profiles(*), categories:category_id(name)")
          .eq("user_type", "creator")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      setPitches(pitchesRes.data || []);
      setProfiles(profilesRes.data || []);
    } else {
      const [oppsRes, profilesRes] = await Promise.all([
        supabase
          .from("brand_opportunities")
          .select("*, profiles:brand_id (full_name, bio, avatar_url, category_id)")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("*, brand_profiles(*), categories:category_id(name)")
          .eq("user_type", "brand")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      setOpportunities(oppsRes.data || []);
      setProfiles(profilesRes.data || []);
    }
  };

  const userType = user?.user_metadata?.user_type || "creator";
  const isCreator = userType === "creator";

  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (opp) => opp.title.toLowerCase().includes(term) || opp.description.toLowerCase().includes(term)
      );
    }
    if (campaignTypeFilter) {
      filtered = filtered.filter((opp) => opp.campaign_type === campaignTypeFilter);
    }
    return filtered;
  }, [opportunities, searchTerm, campaignTypeFilter]);

  const filteredPitches = useMemo(() => {
    let filtered = pitches;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pitch) => pitch.title.toLowerCase().includes(term) || pitch.description.toLowerCase().includes(term)
      );
    }
    if (contentTypeFilter) {
      filtered = filtered.filter((pitch) => pitch.content_type === contentTypeFilter);
    }
    return filtered;
  }, [pitches, searchTerm, contentTypeFilter]);

  const filteredProfiles = useMemo(() => {
    let filtered = profiles;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (profile) =>
          profile.full_name?.toLowerCase().includes(term) || profile.bio?.toLowerCase().includes(term)
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter((profile) => profile.category_id === categoryFilter);
    }
    return filtered;
  }, [profiles, searchTerm, categoryFilter]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setCampaignTypeFilter("");
    setContentTypeFilter("");
    setCategoryFilter("");
  }, []);

  const hasActiveFilters = searchTerm || categoryFilter || campaignTypeFilter || contentTypeFilter;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {isCreator ? "Découvrir les opportunités" : "Découvrir les créateurs"}
        </h1>

        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select
              value={categoryFilter || "all"}
              onValueChange={(val) => setCategoryFilter(val === "all" ? "" : val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue={isCreator ? "opportunities" : "pitches"}>
          <TabsList className="mb-6">
            <TabsTrigger value={isCreator ? "opportunities" : "pitches"}>
              <Briefcase className="h-4 w-4 mr-2" />
              {isCreator ? "Opportunités" : "Pitches"}
            </TabsTrigger>
            <TabsTrigger value="profiles">
              <Users className="h-4 w-4 mr-2" />
              {isCreator ? "Marques" : "Créateurs"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={isCreator ? "opportunities" : "pitches"}>
            {isCreator && (
              <div className="mb-4">
                <Select
                  value={campaignTypeFilter || "all"}
                  onValueChange={(val) => setCampaignTypeFilter(val === "all" ? "" : val)}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Type de campagne" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="sponsorship">Sponsoring</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="review">Test produit</SelectItem>
                    <SelectItem value="ambassador">Ambassadeur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {!isCreator && (
              <div className="mb-4">
                <Select
                  value={contentTypeFilter || "all"}
                  onValueChange={(val) => setContentTypeFilter(val === "all" ? "" : val)}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Type de contenu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isCreator ? (
                filteredOpportunities.length > 0 ? (
                  filteredOpportunities.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)
                ) : (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    Aucune opportunité disponible pour le moment
                  </p>
                )
              ) : filteredPitches.length > 0 ? (
                filteredPitches.map((pitch) => <PitchCard key={pitch.id} pitch={pitch} />)
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  Aucun pitch disponible pour le moment
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profiles">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} isCreator={!isCreator} />
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  Aucun profil disponible pour le moment
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Discover;
