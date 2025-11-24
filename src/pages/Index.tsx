import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
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
            <BrandCard
              logo="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop"
              name="Luma Cosmetics"
              description="Recherche des créateurs lifestyle pour promouvoir notre nouvelle gamme bio."
            />
            <BrandCard
              logo="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop"
              name="GreenBean Coffee"
              description="Campagne d'influence autour de nos cafés durables."
            />
            <BrandCard
              logo="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop"
              name="Sportify Gear"
              description="Partenariats avec des créateurs fitness et lifestyle pour nos équipements."
            />
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
            <CreatorCard
              avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"
              name="MayaFit"
              description="Créatrice de contenu fitness et nutrition, 50k abonnés sur Instagram."
            />
            <CreatorCard
              avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
              name="EcoChic"
              description="Influenceuse lifestyle durable, passion pour les marques écoresponsables."
            />
            <CreatorCard
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
              name="TechGuru"
              description="Vidéos tech et gaming, 80k abonnés sur YouTube et TikTok."
            />
          </div>
        </div>
      </section>

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

const BrandCard = ({ logo, name, description }: { logo: string; name: string; description: string }) => {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="aspect-video overflow-hidden">
        <img 
          src={logo} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-foreground">{name}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
        <Button 
          className="mt-4 w-full group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors" 
          variant="outline"
        >
          Voir les opportunités
        </Button>
      </div>
    </div>
  );
};

const CreatorCard = ({ avatar, name, description }: { avatar: string; name: string; description: string }) => {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="aspect-square overflow-hidden">
        <img 
          src={avatar} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-foreground">{name}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
        <Button 
          className="mt-4 w-full group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors" 
          variant="outline"
        >
          Voir le profil
        </Button>
      </div>
    </div>
  );
};

export default Index;
