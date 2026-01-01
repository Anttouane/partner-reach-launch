import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle, Save } from "lucide-react";

interface OpportunityFormData {
  title: string;
  description: string;
  campaign_type: string;
  budget_range: string;
  target_audience: string;
  requirements: string;
}

interface OpportunityFormProps {
  initialData?: OpportunityFormData;
  onSubmit: (data: OpportunityFormData) => Promise<void>;
  isEdit?: boolean;
}

const OpportunityForm = ({ initialData, onSubmit, isEdit = false }: OpportunityFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<OpportunityFormData>(
    initialData || {
      title: "",
      description: "",
      campaign_type: "",
      budget_range: "",
      target_audience: "",
      requirements: "",
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
            {isEdit ? "Mise à jour..." : "Publication..."}
          </>
        ) : (
          <>
            {isEdit ? <Save className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
            {isEdit ? "Enregistrer les modifications" : "Publier l'opportunité"}
          </>
        )}
      </Button>
    </form>
  );
};

export default OpportunityForm;
