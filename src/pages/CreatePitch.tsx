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
import { Loader2, Sparkles } from "lucide-react";

const CreatePitch = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "",
    tags: "",
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
      if (userType !== "creator") {
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
      const { error } = await supabase.from("pitches").insert({
        creator_id: user.id,
        title: formData.title,
        description: formData.description,
        content_type: formData.content_type || null,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : null,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Pitch créé !",
        description: "Votre pitch est maintenant visible par les marques.",
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Sparkles className="h-8 w-8 mr-3 text-primary" />
            Créer un Pitch
          </h1>
          <p className="text-muted-foreground mt-2">
            Présentez vos idées de collaboration aux marques
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Détails du pitch</CardTitle>
            <CardDescription>
              Décrivez votre concept de manière claire et attractive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du pitch *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Collaboration pour promouvoir des produits tech"
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
                  placeholder="Décrivez votre idée de collaboration, le format de contenu envisagé, etc."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content_type">Type de contenu</Label>
                  <Input
                    id="content_type"
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                    placeholder="Ex: Vidéo YouTube, Post Instagram"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_reach">Portée estimée</Label>
                  <Input
                    id="estimated_reach"
                    type="number"
                    value={formData.estimated_reach}
                    onChange={(e) => setFormData({ ...formData, estimated_reach: e.target.value })}
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Fourchette budgétaire</Label>
                <Input
                  id="budget_range"
                  value={formData.budget_range}
                  onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                  placeholder="Ex: 500€ - 2000€"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tech, lifestyle, gaming"
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
                    <Sparkles className="h-4 w-4 mr-2" />
                    Publier le pitch
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

export default CreatePitch;
