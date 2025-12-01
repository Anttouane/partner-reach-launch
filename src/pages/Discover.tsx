import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Briefcase, MessageSquare, TrendingUp } from "lucide-react";

const Discover = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pitches, setPitches] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userType = user?.user_metadata?.user_type || "creator";
  const isCreator = userType === "creator";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {isCreator ? "Découvrir les opportunités" : "Découvrir les créateurs"}
        </h1>

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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isCreator ? (
                opportunities.length > 0 ? (
                  opportunities.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    Aucune opportunité disponible pour le moment
                  </p>
                )
              ) : (
                pitches.length > 0 ? (
                  pitches.map((pitch) => (
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.length > 0 ? (
                profiles.map((profile) => (
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
        {opportunity.budget_range && (
          <div className="text-sm font-medium">
            Budget : {opportunity.budget_range}
          </div>
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
