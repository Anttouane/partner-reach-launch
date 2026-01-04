import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, ImagePlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PortfolioItem {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  created_at: string;
}

interface PortfolioSectionProps {
  userId: string;
  items: PortfolioItem[];
  onItemsChange: (items: PortfolioItem[]) => void;
  readOnly?: boolean;
}

const PortfolioSection = ({ userId, items, onItemsChange, readOnly = false }: PortfolioSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ title: "", description: "", imageFile: null as File | null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewItem({ ...newItem, imageFile: event.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!newItem.imageFile) {
      toast({
        title: "Image requise",
        description: "Veuillez sélectionner une image.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = newItem.imageFile.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(filePath, newItem.imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("portfolio")
        .getPublicUrl(filePath);

      const { data: insertedItem, error: insertError } = await supabase
        .from("portfolio_items")
        .insert({
          creator_id: userId,
          image_url: publicUrl,
          title: newItem.title || null,
          description: newItem.description || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onItemsChange([insertedItem, ...items]);
      setNewItem({ title: "", description: "", imageFile: null });
      setDialogOpen(false);
      
      toast({
        title: "Image ajoutée !",
        description: "Votre travail a été ajouté au portfolio.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (itemId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/portfolio/');
      if (urlParts[1]) {
        await supabase.storage.from("portfolio").remove([urlParts[1]]);
      }

      const { error } = await supabase
        .from("portfolio_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      onItemsChange(items.filter(item => item.id !== itemId));
      
      toast({
        title: "Image supprimée",
        description: "L'élément a été retiré de votre portfolio.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              Portfolio
            </CardTitle>
            <CardDescription>Montrez vos meilleurs travaux et collaborations</CardDescription>
          </div>
          {!readOnly && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un travail</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {newItem.imageFile ? (
                      <div className="relative">
                        <img 
                          src={URL.createObjectURL(newItem.imageFile)} 
                          alt="Preview" 
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewItem({ ...newItem, imageFile: null });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Cliquez pour sélectionner une image
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Titre (optionnel)</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Campagne Nike Summer 2024"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez ce travail..."
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleUpload} 
                    disabled={uploading || !newItem.imageFile}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Téléchargement...
                      </>
                    ) : (
                      "Ajouter au portfolio"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20">
            <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {readOnly ? "Aucun travail dans le portfolio" : "Ajoutez vos premiers travaux pour enrichir votre profil"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="relative group aspect-square"
                >
                  <img 
                    src={item.image_url} 
                    alt={item.title || "Portfolio item"} 
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(item.id)}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-3">
                    {item.title && (
                      <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    )}
                  </div>

                  {/* Delete button */}
                  {!readOnly && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(item.id, item.image_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Lightbox */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
            {selectedImage && (() => {
              const item = items.find(i => i.id === selectedImage);
              if (!item) return null;
              return (
                <div className="relative">
                  <img 
                    src={item.image_url} 
                    alt={item.title || "Portfolio item"} 
                    className="w-full rounded-lg"
                  />
                  {(item.title || item.description) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                      {item.title && (
                        <h3 className="text-white text-lg font-semibold">{item.title}</h3>
                      )}
                      {item.description && (
                        <p className="text-white/80 text-sm mt-1">{item.description}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PortfolioSection;
