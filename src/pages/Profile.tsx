import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Instagram, Youtube, Twitter, Linkedin, Globe } from "lucide-react";
import PortfolioSection from "@/components/portfolio/PortfolioSection";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PortfolioItem {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  created_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    category_id: "",
    // Social links
    instagram_url: "",
    youtube_url: "",
    tiktok_url: "",
    twitter_url: "",
    linkedin_url: "",
    website_url: "",
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
      await loadCategories();
      await loadProfile(session.user.id);
      await loadPortfolio(session.user.id);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    
    if (data) {
      setCategories(data);
    }
  };

  const loadPortfolio = async (userId: string) => {
    const { data } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });
    
    if (data) {
      setPortfolioItems(data);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileData) {
      setProfile(profileData);
      setAvatarUrl(profileData.avatar_url);
      setFormData(prev => ({
        ...prev,
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
        category_id: profileData.category_id || "",
        instagram_url: profileData.instagram_url || "",
        youtube_url: profileData.youtube_url || "",
        tiktok_url: profileData.tiktok_url || "",
        twitter_url: profileData.twitter_url || "",
        linkedin_url: profileData.linkedin_url || "",
        website_url: profileData.website_url || "",
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    setUploading(true);
    try {
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Photo mise à jour !",
        description: "Votre photo de profil a été changée.",
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
          category_id: formData.category_id || null,
          instagram_url: formData.instagram_url || null,
          youtube_url: formData.youtube_url || null,
          tiktok_url: formData.tiktok_url || null,
          twitter_url: formData.twitter_url || null,
          linkedin_url: formData.linkedin_url || null,
          website_url: formData.website_url || null,
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

        {/* Avatar Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Photo de profil</CardTitle>
            <CardDescription>Cliquez sur l'avatar pour changer votre photo</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {formData.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div 
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <p className="font-medium">{formData.full_name || "Votre nom"}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {isCreator ? "Créateur" : "Marque"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* General Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Complétez votre profil pour être plus visible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nom complet</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Réseaux sociaux</CardTitle>
            <CardDescription>Ajoutez vos liens vers vos réseaux sociaux</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram_url" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" /> Instagram
                </Label>
                <Input
                  id="instagram_url"
                  placeholder="https://instagram.com/username"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube_url" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" /> YouTube
                </Label>
                <Input
                  id="youtube_url"
                  placeholder="https://youtube.com/@channel"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tiktok_url" className="flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  TikTok
                </Label>
                <Input
                  id="tiktok_url"
                  placeholder="https://tiktok.com/@username"
                  value={formData.tiktok_url}
                  onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter_url" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" /> Twitter / X
                </Label>
                <Input
                  id="twitter_url"
                  placeholder="https://twitter.com/username"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </Label>
                <Input
                  id="linkedin_url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Site web
                </Label>
                <Input
                  id="website_url"
                  placeholder="https://monsite.com"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Section - only for creators */}
        {isCreator && user && (
          <PortfolioSection 
            userId={user.id}
            items={portfolioItems}
            onItemsChange={setPortfolioItems}
          />
        )}

        {/* Type-specific fields */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isCreator ? "Informations créateur" : "Informations entreprise"}</CardTitle>
            <CardDescription>
              {isCreator 
                ? "Détails sur votre activité de créateur de contenu"
                : "Détails sur votre entreprise"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCreator ? (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">@ Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@username"
                      value={formData.instagram_handle}
                      onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">@ YouTube</Label>
                    <Input
                      id="youtube"
                      placeholder="@channel"
                      value={formData.youtube_handle}
                      onChange={(e) => setFormData({ ...formData, youtube_handle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiktok">@ TikTok</Label>
                    <Input
                      id="tiktok"
                      placeholder="@username"
                      value={formData.tiktok_handle}
                      onChange={(e) => setFormData({ ...formData, tiktok_handle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="website">Site web entreprise</Label>
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
