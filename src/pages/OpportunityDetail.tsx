import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Building2, Users, Calendar, Loader2, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import OpportunityForm from "@/components/forms/OpportunityForm";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  campaign_type: string | null;
  budget_range: string | null;
  target_audience: string | null;
  requirements: string[] | null;
  deadline: string | null;
  brand_id: string;
  created_at: string;
}

interface BrandProfile {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company_name: string | null;
  website: string | null;
  industry: string | null;
  logo_url: string | null;
}

const OpportunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadOpportunityData();
    };

    checkUser();
  }, [navigate, id]);

  const loadOpportunityData = async () => {
    try {
      // Fetch opportunity
      const { data: oppData, error: oppError } = await supabase
        .from("brand_opportunities")
        .select("*")
        .eq("id", id)
        .single();

      if (oppError) throw oppError;
      setOpportunity(oppData);

      // Fetch brand profile and brand_profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", oppData.brand_id)
        .single();

      if (profileError) throw profileError;

      const { data: brandData, error: brandError } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("id", oppData.brand_id)
        .single();

      if (brandError) throw brandError;

      setBrand({
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        ...brandData,
      });
    } catch (error) {
      console.error("Error loading opportunity:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'opportunité",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!user || !opportunity) return;

    setContacting(true);
    try {
      // Check if conversation already exists
      const { data: existingConv, error: checkError } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${opportunity.brand_id}),and(participant_1.eq.${opportunity.brand_id},participant_2.eq.${user.id})`)
        .single();

      let conversationId;

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            participant_1: user.id,
            participant_2: opportunity.brand_id,
            opportunity_id: opportunity.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        conversationId = newConv.id;
      }

      toast({
        title: "Succès",
        description: "Redirection vers la messagerie...",
      });

      navigate(`/messages?conversation=${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de contacter cette marque",
        variant: "destructive",
      });
    } finally {
      setContacting(false);
    }
  };

  const handleDelete = async () => {
    if (!opportunity) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("brand_opportunities")
        .delete()
        .eq("id", opportunity.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Opportunité supprimée avec succès",
      });

      navigate("/discover");
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'opportunité",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (formData: {
    title: string;
    description: string;
    campaign_type: string;
    budget_range: string;
    target_audience: string;
    requirements: string;
  }) => {
    if (!opportunity) return;

    try {
      const { error } = await supabase
        .from("brand_opportunities")
        .update({
          title: formData.title,
          description: formData.description,
          campaign_type: formData.campaign_type || null,
          budget_range: formData.budget_range || null,
          target_audience: formData.target_audience || null,
          requirements: formData.requirements ? formData.requirements.split(",").map(r => r.trim()) : null,
        })
        .eq("id", opportunity.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Opportunité modifiée avec succès",
      });

      setEditDialogOpen(false);
      loadOpportunityData();
    } catch (error) {
      console.error("Error updating opportunity:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'opportunité",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!opportunity || !brand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Header user={user} />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p>Opportunité non trouvée</p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Retour à la découverte
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Retour
          </Button>
          
          {user?.id === opportunity.brand_id && (
            <div className="flex gap-2">
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Modifier l'opportunité</DialogTitle>
                    <DialogDescription>
                      Modifiez les informations de votre opportunité
                    </DialogDescription>
                  </DialogHeader>
                  <OpportunityForm
                    isEdit
                    initialData={{
                      title: opportunity.title,
                      description: opportunity.description,
                      campaign_type: opportunity.campaign_type || "",
                      budget_range: opportunity.budget_range || "",
                      target_audience: opportunity.target_audience || "",
                      requirements: opportunity.requirements?.join(", ") || "",
                    }}
                    onSubmit={handleEdit}
                  />
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deleting}>
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cette opportunité ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. L'opportunité sera définitivement supprimée.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Opportunity Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{opportunity.title}</CardTitle>
                    {opportunity.campaign_type && (
                      <Badge variant="secondary" className="mb-4">
                        {opportunity.campaign_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{opportunity.description}</p>
                </div>

                {opportunity.requirements && opportunity.requirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Exigences</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {opportunity.requirements.map((req, index) => (
                        <li key={index} className="text-muted-foreground">
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {opportunity.target_audience && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Audience cible</p>
                        <p className="font-semibold">{opportunity.target_audience}</p>
                      </div>
                    </div>
                  )}
                  {opportunity.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date limite</p>
                        <p className="font-semibold">
                          {new Date(opportunity.deadline).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Brand Profile Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>À propos de la marque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={brand.logo_url || brand.avatar_url || undefined} />
                    <AvatarFallback>
                      {brand.company_name?.charAt(0) || brand.full_name?.charAt(0) || "B"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {brand.company_name || brand.full_name}
                    </p>
                    {brand.industry && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {brand.industry}
                      </p>
                    )}
                  </div>
                </div>

                {brand.bio && (
                  <p className="text-sm text-muted-foreground">{brand.bio}</p>
                )}

                {brand.website && (
                  <div>
                    <p className="text-sm text-muted-foreground">Site web</p>
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {brand.website}
                    </a>
                  </div>
                )}

                <Button
                  onClick={handleContact}
                  disabled={contacting || user?.id === opportunity.brand_id}
                  className="w-full"
                >
                  {contacting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Postuler
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OpportunityDetail;
