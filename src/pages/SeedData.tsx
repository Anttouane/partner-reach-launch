import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";

const SeedData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const { toast } = useToast();

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
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Données de Démonstration
            </CardTitle>
            <CardDescription>
              Générez des profils et contenus de démonstration pour votre POC
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
                    <li>3 profils de marques (Nike, L'Oréal, Deliveroo)</li>
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
                  <div>
                    <h3 className="font-semibold mb-2">Comptes Créateurs :</h3>
                    <div className="space-y-2 text-sm">
                      {credentials?.creators.map((c: any, i: number) => (
                        <div key={i} className="bg-muted p-3 rounded-lg">
                          <p><strong>Email:</strong> {c.email}</p>
                          <p><strong>Mot de passe:</strong> {c.password}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Comptes Marques :</h3>
                    <div className="space-y-2 text-sm">
                      {credentials?.brands.map((b: any, i: number) => (
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