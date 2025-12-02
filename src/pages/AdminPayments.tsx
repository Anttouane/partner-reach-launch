import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Euro, TrendingUp, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Payment {
  id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  commission_amount: number;
  commission_rate: number;
  net_amount: number;
  status: string;
  description: string | null;
  created_at: string;
  payer?: { full_name: string | null };
  payee?: { full_name: string | null };
}

const AdminPayments = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [commissionRate, setCommissionRate] = useState("10");
  const [savingRate, setSavingRate] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommissions: 0,
    completedPayments: 0,
    pendingPayments: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch commission rate
      const { data: settings } = await supabase
        .from("platform_settings")
        .select("setting_value")
        .eq("setting_key", "commission_rate")
        .single();

      if (settings) {
        setCommissionRate(settings.setting_value);
      }

      // Fetch payments
      const { data: paymentsData, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des paiements");
        return;
      }

      if (paymentsData) {
        // Fetch user names for each payment
        const paymentsWithNames = await Promise.all(
          paymentsData.map(async (payment) => {
            const { data: payer } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", payment.payer_id)
              .single();

            const { data: payee } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", payment.payee_id)
              .single();

            return {
              ...payment,
              payer: payer || { full_name: "Inconnu" },
              payee: payee || { full_name: "Inconnu" },
            };
          })
        );

        setPayments(paymentsWithNames);

        // Calculate stats
        const completed = paymentsWithNames.filter((p) => p.status === "completed");
        const pending = paymentsWithNames.filter((p) => p.status === "pending");
        
        setStats({
          totalRevenue: completed.reduce((acc, p) => acc + p.amount, 0),
          totalCommissions: completed.reduce((acc, p) => acc + p.commission_amount, 0),
          completedPayments: completed.length,
          pendingPayments: pending.length,
        });
      }
    };

    fetchData();
  }, [user]);

  const handleUpdateCommissionRate = async () => {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Le taux de commission doit être entre 0 et 100");
      return;
    }

    setSavingRate(true);
    const { error } = await supabase
      .from("platform_settings")
      .update({ setting_value: commissionRate })
      .eq("setting_key", "commission_rate");

    if (error) {
      toast.error("Erreur lors de la mise à jour du taux");
    } else {
      toast.success("Taux de commission mis à jour");
    }
    setSavingRate(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Complété</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">En attente</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Échoué</Badge>;
      case "canceled":
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Annulé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Euro className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenus totaux</p>
                  <p className="text-2xl font-bold">{(stats.totalRevenue / 100).toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commissions gagnées</p>
                  <p className="text-2xl font-bold">{(stats.totalCommissions / 100).toFixed(2)} €</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paiements complétés</p>
                  <p className="text-2xl font-bold">{stats.completedPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Commission Rate Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Taux de Commission</CardTitle>
              <CardDescription>
                Définissez le pourcentage prélevé sur chaque transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commission">Commission (%)</Label>
                <div className="flex gap-2">
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                  />
                  <Button onClick={handleUpdateCommissionRate} disabled={savingRate}>
                    {savingRate ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauvegarder"}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Ce taux sera appliqué à tous les nouveaux paiements.
              </p>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Historique des Paiements</CardTitle>
              <CardDescription>
                Liste de tous les paiements effectués sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun paiement pour le moment</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Payeur</TableHead>
                        <TableHead>Bénéficiaire</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-sm">
                            {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                          </TableCell>
                          <TableCell>{payment.payer?.full_name || "Inconnu"}</TableCell>
                          <TableCell>{payment.payee?.full_name || "Inconnu"}</TableCell>
                          <TableCell className="text-right font-medium">
                            {(payment.amount / 100).toFixed(2)} €
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            +{(payment.commission_amount / 100).toFixed(2)} €
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminPayments;
