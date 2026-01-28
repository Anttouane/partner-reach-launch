import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, CheckCircle2, Building2, RefreshCw } from "lucide-react";
import Header from "@/components/Header";

const SeedData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isBrandLoading, setIsBrandLoading] = useState(false);
  const [isBrandDataLoading, setIsBrandDataLoading] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [brandCreated, setBrandCreated] = useState(false);
  const [brandDataSeeded, setBrandDataSeeded] = useState(false);
  const { toast } = useToast();

  const handleCreateDemoBrand = async () => {
    setIsBrandLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-demo-brand`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await response.json();

      if (data.success) {
        setBrandCreated(true);
        toast({
          title: "Compte marque démo créé !",
          description: "Email: marque.demo@partnery.fr / Mot de passe: Demo2025!",
        });
      } else {
        throw new Error(data.error || 'Une erreur est survenue');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBrandLoading(false);
    }
  };

  const handleSeedBrandData = async () => {
    setIsBrandDataLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-brand-data`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await response.json();

      if (data.success) {
        setBrandDataSeeded(true);
        toast({
          title: "Données démo ajoutées !",
          description: `${data.stats.totalPayments} paiements, ${data.stats.totalContracts} contrats créés`,
        });
      } else {
        throw new Error(data.error || 'Une erreur est survenue');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBrandDataLoading(false);
    }
  };

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-demo-data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setCredentials(data.credentials);
        setIsSeeded(true);
        toast({
          title: "Données de démonstration créées !",
          description: "Les profils et contenus de démo sont maintenant disponibles.",
        });
      } else {
        throw new Error(data.error || 'Une erreur est survenue');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={null} />
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Quick Brand Account Creation */}
        <Card className="max-w-2xl mx-auto border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Compte Marque Démo
            </CardTitle>
            <CardDescription>
              Créez ou réinitialisez rapidement le compte marque de démonstration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold mb-1">Identifiants :</p>
              <p className="text-sm">📧 Email: <code className="bg-background px-1 rounded">marque.demo@partnery.fr</code></p>
              <p className="text-sm">🔑 Mot de passe: <code className="bg-background px-1 rounded">Demo2025!</code></p>
            </div>
            
            {brandCreated && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Compte créé/réinitialisé avec succès !</span>
              </div>
            )}

            <Button 
              onClick={handleCreateDemoBrand} 
              disabled={isBrandLoading}
              className="w-full"
            >
              {isBrandLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {brandCreated ? "Réinitialiser le compte" : "Créer le compte marque démo"}
                </>
              )}
            </Button>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Après avoir créé le compte, ajoutez les données démo (paiements, contrats, conversations) :
              </p>
              
              {brandDataSeeded && (
                <div className="flex items-center gap-2 text-green-600 mb-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Données démo ajoutées ! (12 paiements, 5 contrats, 3 conversations)</span>
                </div>
              )}

              <Button 
                onClick={handleSeedBrandData} 
                disabled={isBrandDataLoading}
                variant="secondary"
                className="w-full"
              >
                {isBrandDataLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création des données...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    {brandDataSeeded ? "Réinitialiser les données démo" : "Ajouter paiements, contrats, conversations"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Full Seed Data */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Données de Démonstration Complètes
            </CardTitle>
            <CardDescription>
              Générez des profils et contenus de démonstration complets pour votre POC
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isSeeded ? (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold">Cette action va créer :</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>4 profils de créateurs (Sophie, Lucas, Emma, Thomas)</li>
                    <li>4 pitches de collaboration</li>
                    <li>1 compte marque démo complet (TechStyle France) avec :</li>
                    <ul className="list-disc list-inside ml-4 text-xs">
                      <li>12 paiements réalisés (~51 700€ de dépenses)</li>
                      <li>5 contrats (4 terminés, 1 actif)</li>
                      <li>3 conversations avec créateurs</li>
                    </ul>
                    <li>2 autres marques simples (Nike, L'Oréal)</li>
                    <li>3 opportunités de campagne</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleSeedData} 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Générer les données de démo
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Données créées avec succès !</span>
                </div>

                <div className="space-y-4">
                  {credentials?.demoBrand && (
                    <div className="border-2 border-primary rounded-lg p-4">
                      <h3 className="font-semibold mb-2 text-primary">🏢 Compte Marque Démo (complet) :</h3>
                      <div className="bg-muted p-3 rounded-lg space-y-1">
                        <p><strong>Email:</strong> {credentials.demoBrand.email}</p>
                        <p><strong>Mot de passe:</strong> {credentials.demoBrand.password}</p>
                        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                          <p>💰 Dépenses totales: {credentials.demoBrand.stats.totalSpent}</p>
                          <p>📄 Partenariats: {credentials.demoBrand.stats.totalPartnerships}</p>
                          <p>✅ Contrats actifs: {credentials.demoBrand.stats.activeContracts}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">Comptes Créateurs :</h3>
                    <div className="space-y-2 text-sm">
                      {credentials?.creators?.map((c: any, i: number) => (
                        <div key={i} className="bg-muted p-3 rounded-lg">
                          <p><strong>Email:</strong> {c.email}</p>
                          <p><strong>Mot de passe:</strong> {c.password}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Autres Marques :</h3>
                    <div className="space-y-2 text-sm">
                      {credentials?.otherBrands?.map((b: any, i: number) => (
                        <div key={i} className="bg-muted p-3 rounded-lg">
                          <p><strong>Email:</strong> {b.email}</p>
                          <p><strong>Mot de passe:</strong> {b.password}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Vous pouvez maintenant vous connecter avec ces comptes pour explorer le POC.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedData;