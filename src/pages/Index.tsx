import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Users, TrendingUp, Briefcase, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [pitches, setPitches] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // Load brand opportunities
      const { data: oppsData } = await supabase
        .from("brand_opportunities")
        .select(`
          *,
          profiles:brand_id (full_name, bio, avatar_url, brand_profiles(*))
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      setOpportunities(oppsData || []);

      // Load creator pitches
      const { data: pitchesData } = await supabase
        .from("pitches")
        .select(`
          *,
          profiles:creator_id (full_name, bio, avatar_url, creator_profiles(*))
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      setPitches(pitchesData || []);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/30 px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Plateforme de mise en relation créateurs × marques
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Connectez-vous avec les
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                meilleures marques
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Partnery simplifie la collaboration entre créateurs de contenu et marques. 
              Trouvez les partenariats parfaits, sans intermédiaire.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/auth">
                <Button size="lg" className="group shadow-lg hover:shadow-xl transition-all">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  Découvrir Partnery
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Marques Section */}
          <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/20">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Marques partenaires
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Découvrez les marques qui recherchent des créateurs comme vous
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.length > 0 ? (
                  opportunities.map((opp) => (
                    <BrandCard key={opp.id} opportunity={opp} />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    Aucune opportunité disponible pour le moment
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Créateurs Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Créateurs de contenu
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Rencontrez les créateurs qui façonnent les tendances
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pitches.length > 0 ? (
                  pitches.map((pitch) => (
                    <CreatorCard key={pitch.id} pitch={pitch} />
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    Aucun pitch disponible pour le moment
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à développer vos collaborations ?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Rejoignez Partnery et accédez à des milliers d'opportunités
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="shadow-lg">
                Créer mon compte gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const BrandCard = ({ opportunity }: { opportunity: any }) => {
  const navigate = useNavigate();
  const brandProfile = opportunity.profiles;
  const brandDetails = brandProfile?.brand_profiles;
  
  return (
    <div 
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
      onClick={() => navigate(`/opportunity/${opportunity.id}`)}
    >
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
        {brandDetails?.logo_url ? (
          <img 
            src={brandDetails.logo_url} 
            alt={brandProfile?.full_name || "Marque"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Briefcase className="h-16 w-16 text-primary/50" />
          </div>
        )}
      </div>
      <div className="p-6 space-y-3">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">
            {brandDetails?.company_name || brandProfile?.full_name || "Marque"}
          </h3>
          {opportunity.campaign_type && (
            <Badge variant="secondary">{opportunity.campaign_type}</Badge>
          )}
        </div>
        <p className="text-muted-foreground leading-relaxed line-clamp-3 min-h-[60px]">
          {opportunity.description}
        </p>
        {opportunity.budget_range && (
          <div className="text-sm font-medium text-foreground">
            Budget : {opportunity.budget_range}
          </div>
        )}
        <Button 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/opportunity/${opportunity.id}`);
          }}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Voir les opportunités
        </Button>
      </div>
    </div>
  );
};

const CreatorCard = ({ pitch }: { pitch: any }) => {
  const navigate = useNavigate();
  const creatorProfile = pitch.profiles;
  const creatorDetails = creatorProfile?.creator_profiles;
  
  return (
    <div 
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
      onClick={() => navigate(`/pitch/${pitch.id}`)}
    >
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-accent/10 to-primary/10">
        {creatorProfile?.avatar_url ? (
          <img 
            src={creatorProfile.avatar_url} 
            alt={creatorProfile?.full_name || "Créateur"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="h-16 w-16 text-accent/50" />
          </div>
        )}
      </div>
      <div className="p-6 space-y-3">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">
            {creatorProfile?.full_name || "Créateur"}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {creatorProfile?.bio || pitch.title}
          </p>
        </div>
        <div className="space-y-2">
          {creatorDetails?.audience_size && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2 text-primary" />
              {creatorDetails.audience_size.toLocaleString()} abonnés
            </div>
          )}
          {pitch.estimated_reach && (
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2 text-accent" />
              Portée estimée : {pitch.estimated_reach.toLocaleString()}
            </div>
          )}
        </div>
        <Button 
          className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/pitch/${pitch.id}`);
          }}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Voir le profil
        </Button>
      </div>
    </div>
  );
};

export default Index;
