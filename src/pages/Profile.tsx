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
import { Loader2 } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    // Creator fields
    instagram_handle: "",
    youtube_handle: "",
    tiktok_handle: "",
    audience_size: "",
    engagement_rate: "",
    // Brand fields
    company_name: "",
    industry: "",
    website: "",
    description: "",
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
      setUser(session.user);
      await loadProfile(session.user.id);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileData) {
      setProfile(profileData);
      setFormData(prev => ({
        ...prev,
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
      }));

      if (profileData.user_type === "creator") {
        const { data: creatorData } = await supabase
          .from("creator_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (creatorData) {
          setFormData(prev => ({
            ...prev,
            instagram_handle: creatorData.instagram_handle || "",
            youtube_handle: creatorData.youtube_handle || "",
            tiktok_handle: creatorData.tiktok_handle || "",
            audience_size: creatorData.audience_size?.toString() || "",
            engagement_rate: creatorData.engagement_rate?.toString() || "",
          }));
        }
      } else {
        const { data: brandData } = await supabase
          .from("brand_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (brandData) {
          setFormData(prev => ({
            ...prev,
            company_name: brandData.company_name || "",
            industry: brandData.industry || "",
            website: brandData.website || "",
            description: brandData.description || "",
          }));
        }
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update main profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update type-specific profile
      if (profile?.user_type === "creator") {
        const { error } = await supabase
          .from("creator_profiles")
          .upsert({
            id: user.id,
            instagram_handle: formData.instagram_handle,
            youtube_handle: formData.youtube_handle,
            tiktok_handle: formData.tiktok_handle,
            audience_size: formData.audience_size ? parseInt(formData.audience_size) : null,
            engagement_rate: formData.engagement_rate ? parseFloat(formData.engagement_rate) : null,
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("brand_profiles")
          .upsert({
            id: user.id,
            company_name: formData.company_name,
            industry: formData.industry,
            website: formData.website,
            description: formData.description,
          });

        if (error) throw error;
      }

      toast({
        title: "Profil mis à jour !",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isCreator = profile?.user_type === "creator";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Complétez votre profil pour être plus visible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
              />
            </div>

            {isCreator ? (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@username"
                      value={formData.instagram_handle}
                      onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      placeholder="@channel"
                      value={formData.youtube_handle}
                      onChange={(e) => setFormData({ ...formData, youtube_handle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      placeholder="@username"
                      value={formData.tiktok_handle}
                      onChange={(e) => setFormData({ ...formData, tiktok_handle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Taille d'audience</Label>
                    <Input
                      id="audience"
                      type="number"
                      placeholder="50000"
                      value={formData.audience_size}
                      onChange={(e) => setFormData({ ...formData, audience_size: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="engagement">Taux d'engagement (%)</Label>
                  <Input
                    id="engagement"
                    type="number"
                    step="0.1"
                    placeholder="4.5"
                    value={formData.engagement_rate}
                    onChange={(e) => setFormData({ ...formData, engagement_rate: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company">Nom de l'entreprise</Label>
                  <Input
                    id="company"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Secteur</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description de l'entreprise</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
