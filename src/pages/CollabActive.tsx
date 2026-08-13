import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CreditCard, CheckCircle2, FileText, ShieldCheck } from "lucide-react";

const statusLabels: Record<string, string> = {
  awaiting_payment: "En attente de paiement",
  escrowed: "Fonds séquestrés",
  delivered: "Livrée",
  released: "Paiement libéré",
  refunded: "Remboursée",
  disputed: "En litige",
};

const CollabActive = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [collab, setCollab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [confirming, setConfirming] = useState(searchParams.get("paid") === "1");
  const pollRef = useRef<number | null>(null);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setUser(session.user);
    const { data } = await supabase
      .from("collabs")
      .select("*, campaigns(name, description, brand_id, deadline), profiles:creator_id(full_name)")
      .eq("id", id!)
      .maybeSingle();
    setCollab(data);
    setLoading(false);
    return data;
  };

  useEffect(() => { load(); }, [id]);

  // After returning from Stripe Checkout, wait for the webhook confirmation.
  useEffect(() => {
    if (!confirming) return;
    let tries = 0;
    const tick = async () => {
      tries += 1;
      const data = await load();
      if (data && data.status !== "awaiting_payment") {
        setConfirming(false);
        toast.success("Paiement confirmé, fonds séquestrés");
        return;
      }
      if (tries >= 12) {
        setConfirming(false);
        return;
      }
      pollRef.current = window.setTimeout(tick, 3000);
    };
    pollRef.current = window.setTimeout(tick, 2000);
    return () => { if (pollRef.current) window.clearTimeout(pollRef.current); };
  }, [confirming]);

  const pay = async () => {
    if (!collab) return;
    setActing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-collab-payment", {
        body: { collab_id: collab.id },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erreur de création de paiement");
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur paiement");
    } finally { setActing(false); }
  };

  const markDelivered = async () => {
    setActing(true);
    const { error } = await supabase.from("collabs").update({ status: "delivered" }).eq("id", collab.id);
    if (error) toast.error(error.message);
    else { toast.success("Livraison signalée"); load(); }
    setActing(false);
  };

  const release = async () => {
    setActing(true);
    try {
      const { data, error } = await supabase.functions.invoke("release-collab-payment", {
        body: { collab_id: collab.id },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Paiement libéré au créateur");
      load();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la libération");
    } finally { setActing(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!collab) return <div className="min-h-screen"><Header user={user} /><p className="p-8 text-center">Collaboration introuvable.</p></div>;

  const isBrand = user?.id === collab.campaigns?.brand_id;
  const isCreator = user?.id === collab.creator_id;
  const netCreator = Number(collab.amount) - Number(collab.commission);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead title={`Collab ${collab.campaigns?.name} | Partnery`} description="Statut de la collaboration." />
      <Header user={user} />
      <main className="container mx-auto max-w-3xl px-4 py-8 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-2xl">{collab.campaigns?.name}</CardTitle>
              <Badge>{statusLabels[collab.status] || collab.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {collab.campaigns?.description && <p className="text-sm text-muted-foreground">{collab.campaigns.description}</p>}
            <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
              <div>
                <p className="text-muted-foreground">Montant</p>
                <p className="font-semibold">{Number(collab.amount).toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-muted-foreground">Commission (5%)</p>
                <p className="font-semibold">{Number(collab.commission).toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-muted-foreground">Net créateur</p>
                <p className="font-semibold text-primary">{netCreator.toFixed(2)} €</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Contrat automatique</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Cette collaboration est régie par les <a href="/cgu" className="text-primary underline">CGU Partnery</a>. Les fonds sont conservés par Partnery via Stripe jusqu'à validation de la prestation par la marque.</p>
            <p className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-primary" /> Paiement sécurisé, fonds séquestrés, litige possible via l'onglet Support.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {confirming && collab.status === "awaiting_payment" && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Paiement en cours de confirmation…
              </div>
            )}
            {isBrand && collab.status === "awaiting_payment" && !confirming && (
              <Button onClick={pay} disabled={acting} className="w-full">
                <CreditCard className="h-4 w-4 mr-2" /> Payer {Number(collab.amount).toFixed(2)} € (séquestre)
              </Button>
            )}
            {isCreator && collab.status === "escrowed" && (
              <Button onClick={markDelivered} disabled={acting} className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Marquer la prestation comme livrée
              </Button>
            )}
            {isBrand && collab.status === "delivered" && (
              <Button onClick={release} disabled={acting} className="w-full">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Valider et libérer le paiement
              </Button>
            )}
            {collab.status === "released" && (
              <p className="text-sm text-primary text-center">Collaboration terminée avec succès.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CollabActive;
