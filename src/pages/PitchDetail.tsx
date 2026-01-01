import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, TrendingUp, Loader2, Trash2 } from "lucide-react";
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
interface Pitch {
  id: string;
  title: string;
  description: string;
  content_type: string | null;
  estimated_reach: number | null;
  budget_range: string | null;
  tags: string[] | null;
  creator_id: string;
  created_at: string;
}

interface CreatorProfile {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  audience_size: number | null;
  engagement_rate: number | null;
  content_categories: string[] | null;
}

const PitchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
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
      loadPitchData();
    };

    checkUser();
  }, [navigate, id]);

  const loadPitchData = async () => {
    try {
      // Fetch pitch
      const { data: pitchData, error: pitchError } = await supabase
        .from("pitches")
        .select("*")
        .eq("id", id)
        .single();

      if (pitchError) throw pitchError;
      setPitch(pitchData);

      // Fetch creator profile and creator_profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", pitchData.creator_id)
        .single();

      if (profileError) throw profileError;

      const { data: creatorData, error: creatorError } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("id", pitchData.creator_id)
        .single();

      if (creatorError) throw creatorError;

      setCreator({
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        ...creatorData,
      });
    } catch (error) {
      console.error("Error loading pitch:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le pitch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!user || !pitch) return;

    setContacting(true);
    try {
      // Check if conversation already exists
      const { data: existingConv, error: checkError } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${pitch.creator_id}),and(participant_1.eq.${pitch.creator_id},participant_2.eq.${user.id})`)
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
            participant_2: pitch.creator_id,
            pitch_id: pitch.id,
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
        description: "Impossible de contacter ce créateur",
        variant: "destructive",
      });
    } finally {
      setContacting(false);
    }
  };

  const handleDelete = async () => {
    if (!pitch) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("pitches")
        .delete()
        .eq("id", pitch.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Pitch supprimé avec succès",
      });

      navigate("/discover");
    } catch (error) {
      console.error("Error deleting pitch:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le pitch",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!pitch || !creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
        <Header user={user} />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p>Pitch non trouvé</p>
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
          
          {user?.id === pitch.creator_id && (
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
                  <AlertDialogTitle>Supprimer ce pitch ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le pitch sera définitivement supprimé.
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
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pitch Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{pitch.title}</CardTitle>
                    {pitch.content_type && (
                      <Badge variant="secondary" className="mb-4">
                        {pitch.content_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{pitch.description}</p>
                </div>

                {pitch.tags && pitch.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {pitch.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {pitch.estimated_reach && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Portée estimée</p>
                        <p className="font-semibold">{pitch.estimated_reach.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Creator Profile Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>À propos du créateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={creator.avatar_url || undefined} />
                    <AvatarFallback>
                      {creator.full_name?.charAt(0) || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{creator.full_name}</p>
                    {creator.audience_size && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {creator.audience_size.toLocaleString()} abonnés
                      </p>
                    )}
                  </div>
                </div>

                {creator.bio && (
                  <p className="text-sm text-muted-foreground">{creator.bio}</p>
                )}

                {creator.engagement_rate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Taux d'engagement</p>
                    <p className="font-semibold">{creator.engagement_rate}%</p>
                  </div>
                )}

                {creator.content_categories && creator.content_categories.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Catégories</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.content_categories.map((cat, index) => (
                        <Badge key={index} variant="outline">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  {creator.instagram_handle && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Instagram:</span>{" "}
                      <span className="font-medium">@{creator.instagram_handle}</span>
                    </p>
                  )}
                  {creator.tiktok_handle && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">TikTok:</span>{" "}
                      <span className="font-medium">@{creator.tiktok_handle}</span>
                    </p>
                  )}
                  {creator.youtube_handle && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">YouTube:</span>{" "}
                      <span className="font-medium">@{creator.youtube_handle}</span>
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleContact}
                  disabled={contacting || user?.id === pitch.creator_id}
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
                      Contacter
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

export default PitchDetail;
