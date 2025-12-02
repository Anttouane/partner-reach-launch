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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Settings, Euro, TrendingUp, CreditCard, Loader2, Users, Shield, Percent } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAdmin } from "@/hooks/useAdmin";

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

interface UserProfile {
  id: string;
  full_name: string | null;
  user_type: string;
  commission_rate?: number;
}

const AdminPayments = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [globalCommissionRate, setGlobalCommissionRate] = useState("10");
  const [savingRate, setSavingRate] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userCommissionRate, setUserCommissionRate] = useState("");
  const [savingUserRate, setSavingUserRate] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommissions: 0,
    completedPayments: 0,
    pendingPayments: 0,
  });
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setAuthLoading(false);
    };

    checkUser();
  }, [navigate]);

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && !authLoading && !isAdmin) {
      toast.error("Accès refusé. Vous n'avez pas les droits administrateur.");
      navigate("/dashboard");
    }
  }, [isAdmin, adminLoading, authLoading, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchData = async () => {
      // Fetch global commission rate
      const { data: settings } = await supabase
        .from("platform_settings")
        .select("setting_value")
        .eq("setting_key", "commission_rate")
        .single();

      if (settings) {
        setGlobalCommissionRate(settings.setting_value);
      }

      // Fetch all users with their commission rates
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, user_type")
        .order("full_name");

      if (profilesData) {
        // Fetch user-specific commission rates
        const { data: commissionsData } = await supabase
          .from("user_commissions")
          .select("user_id, commission_rate");

        const commissionMap = new Map(
          commissionsData?.map((c) => [c.user_id, Number(c.commission_rate)]) || []
        );

        const usersWithCommissions = profilesData.map((p) => ({
          ...p,
          commission_rate: commissionMap.get(p.id),
        }));

        setUsers(usersWithCommissions);
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
  }, [user, isAdmin]);

  const handleUpdateGlobalRate = async () => {
    const rate = parseFloat(globalCommissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Le taux doit être entre 0 et 100");
      return;
    }

    setSavingRate(true);
    const { error } = await supabase
      .from("platform_settings")
      .update({ setting_value: globalCommissionRate })
      .eq("setting_key", "commission_rate");

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success("Taux global mis à jour");
    }
    setSavingRate(false);
  };

  const handleOpenUserCommission = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setUserCommissionRate(userProfile.commission_rate?.toString() || globalCommissionRate);
  };

  const handleSaveUserCommission = async () => {
    if (!selectedUser) return;

    const rate = parseFloat(userCommissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Le taux doit être entre 0 et 100");
      return;
    }

    setSavingUserRate(true);

    // Check if user already has a custom rate
    const { data: existing } = await supabase
      .from("user_commissions")
      .select("id")
      .eq("user_id", selectedUser.id)
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase
        .from("user_commissions")
        .update({ commission_rate: rate })
        .eq("user_id", selectedUser.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("user_commissions")
        .insert({ user_id: selectedUser.id, commission_rate: rate });
      error = result.error;
    }

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(`Commission de ${selectedUser.full_name || "l'utilisateur"} mise à jour`);
      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, commission_rate: rate } : u
        )
      );
      setSelectedUser(null);
    }
    setSavingUserRate(false);
  };

  const handleResetUserCommission = async () => {
    if (!selectedUser) return;

    setSavingUserRate(true);
    const { error } = await supabase
      .from("user_commissions")
      .delete()
      .eq("user_id", selectedUser.id);

    if (error) {
      toast.error("Erreur lors de la réinitialisation");
    } else {
      toast.success("Commission réinitialisée au taux global");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, commission_rate: undefined } : u
        )
      );
      setSelectedUser(null);
    }
    setSavingUserRate(false);
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

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Administration</h1>
            <p className="text-muted-foreground">Gestion des paiements et commissions</p>
          </div>
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

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Global Commission Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Commission Globale
              </CardTitle>
              <CardDescription>
                Taux par défaut pour tous les utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commission">Taux (%)</Label>
                <div className="flex gap-2">
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={globalCommissionRate}
                    onChange={(e) => setGlobalCommissionRate(e.target.value)}
                  />
                  <Button onClick={handleUpdateGlobalRate} disabled={savingRate}>
                    {savingRate ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauvegarder"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User-specific commissions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Commissions par Utilisateur
              </CardTitle>
              <CardDescription>
                Définir des taux personnalisés par utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name || "Sans nom"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {u.user_type === "creator" ? "Créateur" : "Marque"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {u.commission_rate !== undefined ? (
                            <span className="text-primary font-medium">{u.commission_rate}%</span>
                          ) : (
                            <span className="text-muted-foreground">{globalCommissionRate}% (global)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenUserCommission(u)}
                          >
                            <Percent className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments History */}
        <Card>
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
                      <TableHead className="text-right">Taux</TableHead>
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
                        <TableCell className="text-right text-muted-foreground">
                          {payment.commission_rate}%
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
      </main>

      {/* User Commission Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commission de {selectedUser?.full_name || "l'utilisateur"}</DialogTitle>
            <DialogDescription>
              Définir un taux de commission personnalisé pour cet utilisateur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Taux de commission (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={userCommissionRate}
                onChange={(e) => setUserCommissionRate(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Taux global actuel: {globalCommissionRate}%
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveUserCommission} disabled={savingUserRate} className="flex-1">
                {savingUserRate ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sauvegarder
              </Button>
              {selectedUser?.commission_rate !== undefined && (
                <Button
                  variant="outline"
                  onClick={handleResetUserCommission}
                  disabled={savingUserRate}
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPayments;
