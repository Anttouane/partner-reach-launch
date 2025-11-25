import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Users, Briefcase, Zap, Heart, Shield, CheckCircle, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [pitches, setPitches] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const { data: oppsData } = await supabase
        .from("brand_opportunities")
        .select(`
          *,
          profiles:brand_id (full_name, bio, avatar_url, brand_profiles(*))
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);

      setOpportunities(oppsData || []);

      const { data: pitchesData } = await supabase
        .from("pitches")
        .select(`
          *,
          profiles:creator_id (full_name, bio, avatar_url, creator_profiles(*))
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);

      setPitches(pitchesData || []);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Partnery</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/discover" className="text-foreground hover:text-primary transition-colors">
                Créateurs
              </Link>
              <Link to="/discover" className="text-foreground hover:text-primary transition-colors">
                Marques
              </Link>
              <a href="#fonctionnement" className="text-foreground hover:text-primary transition-colors">
                Fonctionnement
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </nav>

            <Link to="/auth">
              <Button className="bg-primary text-foreground hover:bg-primary/90 shadow-soft">
                Rejoindre la bêta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-background via-white to-primary/10">
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-primary/20 rounded-full text-sm font-medium text-foreground mb-4">
            ✨ Plateforme de mise en relation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            La plateforme qui facilite les collaborations entre{" "}
            <span className="text-primary">marques</span> et{" "}
            <span className="text-secondary">créateurs</span>
          </h1>
          
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Un espace simple, efficace et accessible, pensé aussi pour les petites marques.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-foreground hover:bg-primary/90 shadow-medium text-lg px-8 py-6">
                Découvrir Partnery
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/discover">
              <Button size="lg" variant="outline" className="border-2 border-primary text-foreground hover:bg-primary/10 text-lg px-8 py-6">
                Explorer les opportunités
              </Button>
            </Link>
          </div>

          {/* Decorative illustration */}
          <div className="pt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-3xl blur-3xl" />
            <div className="relative bg-white/50 backdrop-blur-sm rounded-3xl p-8 border-2 border-primary/30 shadow-medium">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium text-foreground">Créateurs</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-2xl flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-secondary" />
                  </div>
                  <p className="font-medium text-foreground">Marques</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium text-foreground">Rapide</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-2xl flex items-center justify-center">
                    <Heart className="h-8 w-8 text-secondary" />
                  </div>
                  <p className="font-medium text-foreground">Simple</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Exemples - Marques */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Côté Marques</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Des marques qui recrutent
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Découvrez les opportunités de collaboration proposées par les marques
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              </div>
            ) : opportunities.length > 0 ? (
              opportunities.map((opp) => (
                <BrandCard key={opp.id} opportunity={opp} onClick={() => navigate(`/opportunity/${opp.id}`)} />
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-foreground/60">Aucune opportunité disponible pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Exemples - Créateurs */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full mb-4">
              <Users className="h-5 w-5 text-secondary" />
              <span className="text-sm font-semibold text-foreground">Côté Créateurs</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Des créateurs talentueux
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Rencontrez les créateurs prêts à collaborer avec votre marque
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto" />
              </div>
            ) : pitches.length > 0 ? (
              pitches.map((pitch) => (
                <CreatorCard key={pitch.id} pitch={pitch} onClick={() => navigate(`/pitch/${pitch.id}`)} />
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-foreground/60">Aucun créateur disponible pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Fonctionnement */}
      <section id="fonctionnement" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Trois étapes simples pour des collaborations réussies
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-8 rounded-2xl bg-primary/5 border-2 border-primary/20 hover:shadow-soft transition-all">
              <div className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center">
                <Briefcase className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">1. La marque poste</h3>
              <p className="text-foreground/70 leading-relaxed">
                Une marque publie une collaboration avec son budget, ses attentes et sa cible
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-2xl bg-secondary/5 border-2 border-secondary/20 hover:shadow-soft transition-all">
              <div className="w-20 h-20 mx-auto bg-secondary rounded-2xl flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">2. Les créateurs postulent</h3>
              <p className="text-foreground/70 leading-relaxed">
                Les créateurs intéressés proposent leur profil et leur vision du projet
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-2xl bg-primary/5 border-2 border-primary/20 hover:shadow-soft transition-all">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">3. Match & partenariat</h3>
              <p className="text-foreground/70 leading-relaxed">
                La marque choisit son créateur et la collaboration démarre facilement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Pourquoi Partnery */}
      <section className="py-20 px-4 bg-gradient-to-br from-background to-primary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Pourquoi Partnery ?
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Une plateforme pensée pour tous
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 space-y-4 shadow-medium hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Simple</h3>
              <p className="text-foreground/70 leading-relaxed">
                Interface intuitive et processus fluide. Pas de complexité inutile, juste l'essentiel.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 space-y-4 shadow-medium hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Accessible</h3>
              <p className="text-foreground/70 leading-relaxed">
                Pensé pour les petites marques et les créateurs émergents. Tous les budgets sont bienvenus.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 space-y-4 shadow-medium hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Équitable</h3>
              <p className="text-foreground/70 leading-relaxed">
                Transparence des prix et conditions claires. Chacun trouve son compte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-3xl p-12 md:p-16 text-center shadow-medium">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Prêt à transformer vos collaborations ?
            </h2>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              Rejoignez Partnery dès aujourd'hui et accédez à des milliers d'opportunités
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90 shadow-medium text-lg px-10 py-6">
                Rejoindre la bêta gratuitement
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 bg-foreground text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Partnery</span>
              </div>
              <p className="text-white/70 text-sm">
                La plateforme qui connecte marques et créateurs
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/discover" className="hover:text-primary transition-colors">Créateurs</Link></li>
                <li><Link to="/discover" className="hover:text-primary transition-colors">Marques</Link></li>
                <li><a href="#fonctionnement" className="hover:text-primary transition-colors">Fonctionnement</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-primary transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Confidentialité</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-white/70 mb-4">contact@partnery.app</p>
              <Link to="/auth">
                <Button className="bg-primary text-foreground hover:bg-primary/90 w-full">
                  Rejoindre la bêta
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-sm text-white/60">
            <p>© 2024 Partnery. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const BrandCard = ({ opportunity, onClick }: { opportunity: any; onClick: () => void }) => {
  const brandProfile = opportunity.profiles;
  const brandDetails = brandProfile?.brand_profiles;
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-3xl overflow-hidden border-2 border-primary/20 hover:border-primary hover:shadow-medium transition-all cursor-pointer"
    >
      <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {brandDetails?.logo_url ? (
          <img 
            src={brandDetails.logo_url} 
            alt={brandDetails?.company_name || "Marque"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Briefcase className="h-20 w-20 text-primary/40" />
          </div>
        )}
      </div>
      <div className="p-6 space-y-3">
        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
          {brandDetails?.company_name || brandProfile?.full_name || "Marque"}
        </h3>
        <p className="text-foreground/80 leading-relaxed line-clamp-3">
          {opportunity.title}
        </p>
        {opportunity.budget_range && (
          <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-foreground">
            {opportunity.budget_range}
          </div>
        )}
      </div>
    </div>
  );
};

const CreatorCard = ({ pitch, onClick }: { pitch: any; onClick: () => void }) => {
  const creatorProfile = pitch.profiles;
  const creatorDetails = creatorProfile?.creator_profiles;
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-3xl overflow-hidden border-2 border-secondary/20 hover:border-secondary hover:shadow-medium transition-all cursor-pointer"
    >
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-secondary/20 to-secondary/5">
        {creatorProfile?.avatar_url ? (
          <img 
            src={creatorProfile.avatar_url} 
            alt={creatorProfile?.full_name || "Créateur"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="h-20 w-20 text-secondary/40" />
          </div>
        )}
      </div>
      <div className="p-6 space-y-3">
        <h3 className="text-2xl font-bold text-foreground group-hover:text-secondary transition-colors">
          {creatorProfile?.full_name || "Créateur"}
        </h3>
        <p className="text-foreground/80 leading-relaxed line-clamp-3">
          {pitch.title}
        </p>
        {creatorDetails?.audience_size && (
          <div className="inline-block px-3 py-1 bg-secondary/10 rounded-full text-sm font-medium text-foreground">
            {creatorDetails.audience_size.toLocaleString()} abonnés
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
