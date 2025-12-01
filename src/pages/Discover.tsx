import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Briefcase, MessageSquare, TrendingUp, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Discover = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pitches, setPitches] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredPitches, setFilteredPitches] = useState<any[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await loadData(session.user);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadData = async (currentUser: User) => {
    const userType = currentUser.user_metadata?.user_type || "creator";

    if (userType === "brand") {
      // Load creator pitches
      const { data: pitchesData } = await supabase
        .from("pitches")
        .select(`
          *,
          profiles:creator_id (full_name, bio)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      setPitches(pitchesData || []);

      // Load creator profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*, creator_profiles(*)")
        .eq("user_type", "creator")
        .order("created_at", { ascending: false })
        .limit(20);

      setProfiles(profilesData || []);
    } else {
      // Load brand opportunities
      const { data: oppsData } = await supabase
        .from("brand_opportunities")
        .select(`
          *,
          profiles:brand_id (full_name, bio)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      setOpportunities(oppsData || []);

      // Load brand profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*, brand_profiles(*)")
        .eq("user_type", "brand")
        .order("created_at", { ascending: false })
        .limit(20);

      setProfiles(profilesData || []);
    }
  };

  const userType = user?.user_metadata?.user_type || "creator";
  const isCreator = userType === "creator";

  useEffect(() => {
    let filtered = opportunities;
    if (searchTerm) {
      filtered = filtered.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (campaignTypeFilter) {
      filtered = filtered.filter((opp) => opp.campaign_type === campaignTypeFilter);
    }
    setFilteredOpportunities(filtered);
  }, [opportunities, searchTerm, campaignTypeFilter]);

  useEffect(() => {
    let filtered = pitches;
    if (searchTerm) {
      filtered = filtered.filter(
        (pitch) =>
          pitch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pitch.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (contentTypeFilter) {
      filtered = filtered.filter((pitch) => pitch.content_type === contentTypeFilter);
    }
    setFilteredPitches(filtered);
  }, [pitches, searchTerm, contentTypeFilter]);

  useEffect(() => {
    let filtered = profiles;
    if (searchTerm) {
      filtered = filtered.filter(
        (profile) =>
          profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (industryFilter && !isCreator) {
      filtered = filtered.filter((profile) => profile.brand_profiles?.industry === industryFilter);
    }
    setFilteredProfiles(filtered);
  }, [profiles, searchTerm, industryFilter, isCreator]);

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
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
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
                <Select value={campaignTypeFilter} onValueChange={setCampaignTypeFilter}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Type de campagne" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les types</SelectItem>
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
                <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Type de contenu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les types</SelectItem>
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
                  filteredOpportunities.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    Aucune opportunité disponible pour le moment
                  </p>
                )
              ) : (
                filteredPitches.length > 0 ? (
                  filteredPitches.map((pitch) => (
                    <PitchCard key={pitch.id} pitch={pitch} />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    Aucun pitch disponible pour le moment
                  </p>
                )
              )}
            </div>
          </TabsContent>

          <TabsContent value="profiles">
            {!isCreator && (
              <div className="mb-4">
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les secteurs</SelectItem>
                    <SelectItem value="tech">Technologie</SelectItem>
                    <SelectItem value="fashion">Mode</SelectItem>
                    <SelectItem value="beauty">Beauté</SelectItem>
                    <SelectItem value="food">Alimentation</SelectItem>
                    <SelectItem value="sport">Sport</SelectItem>
                    <SelectItem value="travel">Voyage</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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

const PitchCard = ({ pitch }: { pitch: any }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/pitch/${pitch.id}`)}>
      <CardHeader>
        <CardTitle className="text-lg">{pitch.title}</CardTitle>
        <CardDescription>
          Par {pitch.profiles?.full_name || "Créateur"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {pitch.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {pitch.tags?.map((tag: string, i: number) => (
            <Badge key={i} variant="secondary">{tag}</Badge>
          ))}
        </div>
        {pitch.estimated_reach && (
          <div className="flex items-center text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 mr-2" />
            Portée estimée : {pitch.estimated_reach.toLocaleString()}
          </div>
        )}
        <Button className="w-full" onClick={(e) => {
          e.stopPropagation();
          navigate(`/pitch/${pitch.id}`);
        }}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Voir les détails
        </Button>
      </CardContent>
    </Card>
  );
};

const OpportunityCard = ({ opportunity }: { opportunity: any }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/opportunity/${opportunity.id}`)}>
      <CardHeader>
        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
        <CardDescription>
          Par {opportunity.profiles?.full_name || "Marque"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {opportunity.description}
        </p>
        {opportunity.campaign_type && (
          <Badge>{opportunity.campaign_type}</Badge>
        )}
        <Button className="w-full" onClick={(e) => {
          e.stopPropagation();
          navigate(`/opportunity/${opportunity.id}`);
        }}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Voir les détails
        </Button>
      </CardContent>
    </Card>
  );
};

const ProfileCard = ({ profile, isCreator }: { profile: any; isCreator: boolean }) => {
  const details = isCreator ? profile.creator_profiles : profile.brand_profiles;
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{profile.full_name || "Sans nom"}</CardTitle>
        <CardDescription className="line-clamp-2">
          {profile.bio || "Aucune bio"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCreator && details && (
          <>
            {details.audience_size && (
              <div className="text-sm">
                <Users className="h-4 w-4 inline mr-2" />
                {details.audience_size.toLocaleString()} abonnés
              </div>
            )}
            {details.engagement_rate && (
              <div className="text-sm">
                <TrendingUp className="h-4 w-4 inline mr-2" />
                {details.engagement_rate}% d'engagement
              </div>
            )}
          </>
        )}
        {!isCreator && details && (
          <>
            {details.company_name && (
              <div className="text-sm font-medium">{details.company_name}</div>
            )}
            {details.industry && (
              <Badge variant="secondary">{details.industry}</Badge>
            )}
          </>
        )}
        <Button variant="outline" className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contacter
        </Button>
      </CardContent>
    </Card>
  );
};

export default Discover;
