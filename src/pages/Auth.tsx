import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Building2, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"creator" | "brand">("creator");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer votre adresse email.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email envoyé !",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            user_type: userType,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Compte créé avec succès !",
        description: "Vous pouvez maintenant vous connecter.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie !",
        description: "Bienvenue sur Partnery.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <SEOHead title="Connexion | Partnery" description="Connectez-vous ou créez votre compte Partnery pour accéder à la plateforme de mise en relation créateurs et marques." />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Bienvenue sur Partnery</h1>
          <p className="text-muted-foreground">
            Connectez-vous ou créez votre compte
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Authentification</CardTitle>
            <CardDescription>
              Choisissez votre type de compte pour commencer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </button>
                <div className="space-y-2">
                  <Label htmlFor="email-forgot">Email</Label>
                  <Input
                    id="email-forgot"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                <Button
                  onClick={handleForgotPassword}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Envoi..." : "Envoyer le lien"}
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Connexion</TabsTrigger>
                  <TabsTrigger value="signup">Inscription</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-signin">Email</Label>
                      <Input
                        id="email-signin"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password-signin">Mot de passe</Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <Input
                        id="password-signin"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
                  <div className="space-y-4 mb-4">
                    <Label>Type de compte</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setUserType("creator")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          userType === "creator"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="font-medium">Créateur</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Influenceur
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("brand")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          userType === "brand"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="font-medium">Marque</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Entreprise
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Mot de passe</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Création..." : "Créer mon compte"}
                  </Button>
                </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
