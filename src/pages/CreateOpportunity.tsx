import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";

const CreateOpportunity = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    campaign_type: "",
    budget_range: "",
    target_audience: "",
    requirements: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      const userType = session.user.user_metadata?.user_type;
      if (userType !== "brand") {
        navigate("/dashboard");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("brand_opportunities").insert({
        brand_id: user.id,
        title: formData.title,
        description: formData.description,
        campaign_type: formData.campaign_type || null,
        budget_range: formData.budget_range || null,
        target_audience: formData.target_audience || null,
        requirements: formData.requirements ? formData.requirements.split(",").map(r => r.trim()) : null,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Annonce créée !",
        description: "Votre opportunité est maintenant visible par les créateurs.",
      });

      navigate("/discover");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <PlusCircle className="h-8 w-8 mr-3 text-primary" />
            Poster une Opportunité
          </h1>
          <p className="text-muted-foreground mt-2">
            Trouvez les créateurs parfaits pour votre campagne
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Détails de l'opportunité</CardTitle>
            <CardDescription>
              Décrivez clairement votre besoin pour attirer les bons créateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la campagne *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Recherche créateur tech pour lancement produit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="Décrivez votre campagne, vos objectifs, le format attendu..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign_type">Type de campagne</Label>
                  <Input
                    id="campaign_type"
                    value={formData.campaign_type}
                    onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                    placeholder="Ex: Unboxing, Review, Sponsoring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_range">Budget</Label>
                  <Input
                    id="budget_range"
                    value={formData.budget_range}
                    onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                    placeholder="Ex: 1000€ - 5000€"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">Audience cible</Label>
                <Input
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="Ex: Gamers 18-35 ans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Prérequis (séparés par des virgules)</Label>
                <Input
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Min 50K abonnés, Taux engagement >3%, Thématique tech"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Publier l'opportunité
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateOpportunity;
