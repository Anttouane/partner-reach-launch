import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Trash2, XCircle, Eye, Loader2, Megaphone, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface MyContentListProps {
  userId: string;
  userType: "creator" | "brand";
}

interface ContentItem {
  id: string;
  title: string;
  status: string | null;
  created_at: string;
  type: "pitch" | "opportunity";
}

const MyContentList = ({ userId, userType }: MyContentListProps) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadContent = async () => {
    try {
      if (userType === "creator") {
        const { data } = await supabase
          .from("pitches")
          .select("id, title, status, created_at")
          .eq("creator_id", userId)
          .order("created_at", { ascending: false });
        setItems((data || []).map(d => ({ ...d, type: "pitch" as const })));
      } else {
        const { data } = await supabase
          .from("brand_opportunities")
          .select("id, title, status, created_at")
          .eq("brand_id", userId)
          .order("created_at", { ascending: false });
        setItems((data || []).map(d => ({ ...d, type: "opportunity" as const })));
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [userId, userType]);

  const handleDeletePitch = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase.from("pitches").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Succès", description: "Pitch supprimé avec succès" });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer le pitch", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseOpportunity = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("brand_opportunities")
        .update({ status: "closed" })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Succès", description: "Campagne clôturée avec succès" });
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: "closed" } : i));
    } catch {
      toast({ title: "Erreur", description: "Impossible de clôturer la campagne", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase.from("brand_opportunities").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Succès", description: "Campagne supprimée avec succès" });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer la campagne", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const statusLabel = (status: string | null) => {
    switch (status) {
      case "active": return { label: "Active", variant: "default" as const };
      case "closed": return { label: "Clôturée", variant: "secondary" as const };
      default: return { label: status || "Active", variant: "outline" as const };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isCreator = userType === "creator";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {isCreator ? <Sparkles className="h-5 w-5 text-primary" /> : <Megaphone className="h-5 w-5 text-secondary" />}
            {isCreator ? "Mes Pitches" : "Mes Campagnes"}
          </CardTitle>
          <CardDescription>
            {isCreator ? "Gérez vos propositions de contenu" : "Gérez vos opportunités publiées"}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(isCreator ? "/create-pitch" : "/create-opportunity")}
        >
          + {isCreator ? "Nouveau pitch" : "Nouvelle campagne"}
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun {isCreator ? "pitch" : "campagne"} pour le moment</p>
            <Button
              variant="link"
              onClick={() => navigate(isCreator ? "/create-pitch" : "/create-opportunity")}
              className="mt-2"
            >
              {isCreator ? "Créer votre premier pitch" : "Publier votre première campagne"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const { label, variant } = statusLabel(item.status);
              const isClosed = item.status === "closed";
              return (
                <motion.div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={variant} className="text-xs">{label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(isCreator ? `/pitch/${item.id}` : `/opportunity/${item.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {!isCreator && !isClosed && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={actionLoading === item.id}>
                            {actionLoading === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 text-amber-500" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Clôturer cette campagne ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              La campagne ne sera plus visible par les créateurs. Vous pourrez toujours la consulter.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCloseOpportunity(item.id)}>
                              Clôturer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={actionLoading === item.id}>
                          {actionLoading === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Supprimer {isCreator ? "ce pitch" : "cette campagne"} ?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. {isCreator ? "Le pitch" : "La campagne"} sera définitivement supprimé{isCreator ? "" : "e"}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => isCreator ? handleDeletePitch(item.id) : handleDeleteOpportunity(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyContentList;
