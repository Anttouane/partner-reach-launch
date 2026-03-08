import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Instagram, Youtube, Twitter, Linkedin, Globe, Users, TrendingUp, Sparkles, Building2 } from "lucide-react";
import SocialLinks from "@/components/discover/SocialLinks";
import PortfolioPreview from "@/components/portfolio/PortfolioPreview";

const PublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [pitches, setPitches] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      if (!id) return;

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*, categories(name)")
        .eq("id", id)
        .single();

      if (!profileData) {
        navigate("/discover");
        return;
      }

      setProfile(profileData);

      if (profileData.user_type === "creator") {
        const { data: cp } = await supabase
          .from("creator_profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        setCreatorProfile(cp);

        const { data: portfolio } = await supabase
          .from("portfolio_items")
          .select("*")
          .eq("creator_id", id)
          .order("created_at", { ascending: false });
        setPortfolioItems(portfolio || []);

        const { data: userPitches } = await supabase
          .from("pitches")
          .select("*")
          .eq("creator_id", id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(5);
        setPitches(userPitches || []);
      } else {
        const { data: bp } = await supabase
          .from("brand_profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        setBrandProfile(bp);

        const { data: brandOpps } = await supabase
          .from("brand_opportunities")
          .select("*")
          .eq("brand_id", id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(5);
        setOpportunities(brandOpps || []);
      }

      setLoading(false);
    };

    init();
  }, [id, navigate]);

  const handleContact = async () => {
    if (!user || !id) return;

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${id}),and(participant_1.eq.${id},participant_2.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      navigate("/messages");
      return;
    }

    // Create new conversation
    const { data: newConvo, error } = await supabase
      .from("conversations")
      .insert({
        participant_1: user.id,
        participant_2: id,
      })
      .select()
      .single();

    if (!error && newConvo) {
      navigate("/messages");
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const isCreator = profile.user_type === "creator";
  const isOwnProfile = user?.id === id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead
        title={`${profile.full_name || "Profil"} | Partnery`}
        description={profile.bio || "Profil utilisateur sur Partnery"}
      />
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary/50" />
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={profile.avatar_url} className="object-cover" />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                  {profile.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground">
                    {profile.full_name || "Utilisateur"}
                  </h1>
                  <Badge variant="secondary" className="capitalize">
                    {isCreator ? (
                      <><Sparkles className="h-3 w-3 mr-1" /> Créateur</>
                    ) : (
                      <><Building2 className="h-3 w-3 mr-1" /> Marque</>
                    )}
                  </Badge>
                  {profile.categories && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {profile.categories.name}
                    </Badge>
                  )}
                </div>

                {/* Brand company name */}
                {!isCreator && brandProfile?.company_name && (
                  <p className="text-muted-foreground mt-1 font-medium">{brandProfile.company_name}</p>
                )}

                {profile.bio && (
                  <p className="text-muted-foreground mt-3 leading-relaxed">{profile.bio}</p>
                )}

                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <SocialLinks
                    instagram_url={profile.instagram_url}
                    youtube_url={profile.youtube_url}
                    twitter_url={profile.twitter_url}
                    linkedin_url={profile.linkedin_url}
                    website_url={profile.website_url}
                  />
                </div>

                {!isOwnProfile && (
                  <Button onClick={handleContact} className="mt-4">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                )}
                {isOwnProfile && (
                  <Link to="/profile">
                    <Button variant="outline" className="mt-4">
                      Modifier mon profil
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creator Stats */}
        {isCreator && creatorProfile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {creatorProfile.instagram_followers && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center hover:bg-primary/10 transition-colors">
                    <Instagram className="h-5 w-5 mx-auto mb-2 text-pink-500" />
                    <div className="text-lg font-bold text-foreground">{formatFollowers(creatorProfile.instagram_followers)}</div>
                    <div className="text-xs text-muted-foreground">Instagram</div>
                  </div>
                )}
                {creatorProfile.youtube_followers && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center hover:bg-primary/10 transition-colors">
                    <Youtube className="h-5 w-5 mx-auto mb-2 text-red-500" />
                    <div className="text-lg font-bold text-foreground">{formatFollowers(creatorProfile.youtube_followers)}</div>
                    <div className="text-xs text-muted-foreground">YouTube</div>
                  </div>
                )}
                {creatorProfile.tiktok_followers && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center hover:bg-primary/10 transition-colors">
                    <svg className="h-5 w-5 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <div className="text-lg font-bold text-foreground">{formatFollowers(creatorProfile.tiktok_followers)}</div>
                    <div className="text-xs text-muted-foreground">TikTok</div>
                  </div>
                )}
                {creatorProfile.engagement_rate && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center hover:bg-accent/10 transition-colors">
                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-accent" />
                    <div className="text-lg font-bold text-foreground">{creatorProfile.engagement_rate}%</div>
                    <div className="text-xs text-muted-foreground">Engagement</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brand info */}
        {!isCreator && brandProfile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">À propos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {brandProfile.industry && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{brandProfile.industry}</Badge>
                </div>
              )}
              {brandProfile.description && (
                <p className="text-muted-foreground leading-relaxed">{brandProfile.description}</p>
              )}
              {brandProfile.website && (
                <a href={brandProfile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {brandProfile.website}
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Portfolio */}
        {isCreator && portfolioItems.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="aspect-square rounded-xl overflow-hidden">
                    <img src={item.image_url} alt={item.title || "Portfolio"} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Pitches */}
        {isCreator && pitches.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Pitchs actifs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pitches.map((pitch) => (
                <Link key={pitch.id} to={`/pitch/${pitch.id}`} className="block">
                  <div className="p-4 rounded-xl border hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <h3 className="font-medium text-foreground">{pitch.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{pitch.description}</p>
                    {pitch.tags && pitch.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {pitch.tags.slice(0, 3).map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Active Opportunities */}
        {!isCreator && opportunities.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Opportunités actives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {opportunities.map((opp) => (
                <Link key={opp.id} to={`/opportunity/${opp.id}`} className="block">
                  <div className="p-4 rounded-xl border hover:border-secondary/30 hover:bg-secondary/5 transition-all">
                    <h3 className="font-medium text-foreground">{opp.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{opp.description}</p>
                    {opp.campaign_type && (
                      <Badge variant="outline" className="mt-2 text-xs">{opp.campaign_type}</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PublicProfile;
