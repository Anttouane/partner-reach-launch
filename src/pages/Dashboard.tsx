import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User as UserIcon, Search, MessageSquare, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  const userType = user?.user_metadata?.user_type || "creator";
  const isCreator = userType === "creator";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Partnery</h1>
            <div className="flex gap-2 items-center">
              <Button variant="ghost" size="sm">
                <UserIcon className="h-4 w-4 mr-2" />
                {user?.email}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {isCreator ? "Dashboard Créateur" : "Dashboard Marque"}
          </h2>
          <p className="text-muted-foreground">
            {isCreator
              ? "Gérez vos collaborations et découvrez de nouvelles opportunités"
              : "Trouvez les créateurs parfaits pour vos campagnes"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Search className="h-5 w-5" />}
            title={isCreator ? "Opportunités" : "Créateurs disponibles"}
            value="24"
            description="Nouvelles cette semaine"
          />
          <StatCard
            icon={<MessageSquare className="h-5 w-5" />}
            title="Messages"
            value="8"
            description="Non lus"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            title={isCreator ? "Revenus" : "Campagnes actives"}
            value={isCreator ? "2 450 €" : "5"}
            description={isCreator ? "Ce mois-ci" : "En cours"}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                {isCreator
                  ? "Développez votre présence"
                  : "Lancez votre prochaine campagne"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <UserIcon className="h-4 w-4 mr-2" />
                Compléter mon profil
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                {isCreator ? "Explorer les marques" : "Rechercher des créateurs"}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Voir mes messages
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Vos dernières interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  title="Nouveau message"
                  description="Une marque vous a contacté"
                  time="Il y a 2h"
                />
                <ActivityItem
                  title="Profil consulté"
                  description="Votre profil a été vu 12 fois"
                  time="Aujourd'hui"
                />
                <ActivityItem
                  title="Collaboration terminée"
                  description="Paiement reçu de 850€"
                  time="Hier"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, title, value, description }: { icon: React.ReactNode; title: string; value: string; description: string }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityItem = ({ title, description, time }: { title: string; description: string; time: string }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;
