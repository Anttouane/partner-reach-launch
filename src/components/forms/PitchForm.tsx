import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Save } from "lucide-react";

interface PitchFormData {
  title: string;
  description: string;
  content_type: string;
  estimated_reach: string;
  budget_range: string;
  tags: string;
}

interface PitchFormProps {
  initialData?: PitchFormData;
  onSubmit: (data: PitchFormData) => Promise<void>;
  isEdit?: boolean;
}

const PitchForm = ({ initialData, onSubmit, isEdit = false }: PitchFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PitchFormData>(
    initialData || {
      title: "",
      description: "",
      content_type: "",
      estimated_reach: "",
      budget_range: "",
      tags: "",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            {isEdit ? "Mise à jour..." : "Publication..."}
          </>
        ) : (
          <>
            {isEdit ? <Save className="h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {isEdit ? "Enregistrer les modifications" : "Publier le pitch"}
          </>
        )}
      </Button>
    </form>
  );
};

export default PitchForm;
