import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet as WalletIcon, ArrowDownToLine, History, Euro, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Payment {
  id: string;
  amount: number;
  net_amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
  description: string | null;
  payer_id: string;
  payer?: {
    full_name: string | null;
  };
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  processed_at: string | null;
  iban: string | null;
}

const Wallet = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawIban, setWithdrawIban] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      const userType = session.user.user_metadata?.user_type;
      if (userType !== "creator") {
        navigate("/dashboard");
        toast.error("Le portefeuille est réservé aux créateurs");
        return;
      }
      
      setUser(session.user);
      await loadWalletData(session.user.id);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadWalletData = async (userId: string) => {
    // Load payments received (where user is payee)
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .eq("payee_id", userId)
      .order("created_at", { ascending: false });

    // Fetch payer profiles for each payment
    if (paymentsData && paymentsData.length > 0) {
      const payerIds = [...new Set(paymentsData.map(p => p.payer_id))];
      const { data: payerProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", payerIds);
      
      const payerMap = new Map(payerProfiles?.map(p => [p.id, p.full_name]) || []);
      const paymentsWithPayer = paymentsData.map(p => ({
        ...p,
        payer: { full_name: payerMap.get(p.payer_id) || null }
      }));
      setPayments(paymentsWithPayer);
    } else {
      setPayments([]);
    }

    // Load withdrawals
    const { data: withdrawalsData } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setWithdrawals(withdrawalsData || []);

    // Calculate balances
    const completedPayments = (paymentsData || []).filter(p => p.status === "completed");
    const totalEarned = completedPayments.reduce((sum, p) => sum + p.net_amount, 0);
    
    const completedWithdrawals = (withdrawalsData || []).filter(w => w.status === "completed");
    const pendingWithdrawals = (withdrawalsData || []).filter(w => w.status === "pending");
    
    const totalWithdrawn = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const totalPending = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    setAvailableBalance(totalEarned - totalWithdrawn - totalPending);
    setPendingBalance(totalPending);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }
    
    if (amount > availableBalance / 100) {
      toast.error("Montant supérieur au solde disponible");
      return;
    }
    
    if (!withdrawIban || withdrawIban.length < 15) {
      toast.error("Veuillez entrer un IBAN valide");
      return;
    }
    
    setWithdrawing(true);
    
    try {
      const { error } = await supabase
        .from("withdrawals")
        .insert({
          user_id: user?.id,
          amount: Math.round(amount * 100), // Convert to cents
          iban: withdrawIban,
          status: "pending"
        });
      
      if (error) throw error;
      
      toast.success("Demande de retrait envoyée");
      setDialogOpen(false);
      setWithdrawAmount("");
      setWithdrawIban("");
      await loadWalletData(user!.id);
    } catch (error: any) {
      toast.error("Erreur lors de la demande de retrait");
      console.error(error);
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Complété</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">En attente</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Échoué</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <WalletIcon className="h-8 w-8" />
          Mon portefeuille
        </h1>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Solde disponible</CardDescription>
              <CardTitle className="text-3xl text-green-500">
                {(availableBalance / 100).toFixed(2)} €
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={availableBalance <= 0}>
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Retirer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Demander un retrait</DialogTitle>
                    <DialogDescription>
                      Entrez le montant à retirer et votre IBAN
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Montant (€)</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="pl-10"
                          max={availableBalance / 100}
                          step="0.01"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Maximum: {(availableBalance / 100).toFixed(2)} €
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>IBAN</Label>
                      <Input
                        placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                        value={withdrawIban}
                        onChange={(e) => setWithdrawIban(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Les retraits sont traités sous 3-5 jours ouvrés
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleWithdraw} disabled={withdrawing}>
                      {withdrawing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Confirmer le retrait
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En attente de retrait</CardDescription>
              <CardTitle className="text-3xl text-yellow-500">
                {(pendingBalance / 100).toFixed(2)} €
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Retraits en cours de traitement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total gagné</CardDescription>
              <CardTitle className="text-3xl">
                {(payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.net_amount, 0) / 100).toFixed(2)} €
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Depuis le début
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Paiements reçus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>De</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Montant brut</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Net reçu</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.payer?.full_name || "Marque"}
                      </TableCell>
                      <TableCell>{payment.description || "Paiement"}</TableCell>
                      <TableCell>{(payment.amount / 100).toFixed(2)} €</TableCell>
                      <TableCell className="text-muted-foreground">
                        -{(payment.commission_amount / 100).toFixed(2)} €
                      </TableCell>
                      <TableCell className="font-medium">
                        {(payment.net_amount / 100).toFixed(2)} €
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun paiement reçu pour le moment
              </p>
            )}
          </CardContent>
        </Card>

        {/* Withdrawals History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique des retraits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Traité le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        {format(new Date(withdrawal.created_at), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {(withdrawal.amount / 100).toFixed(2)} €
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {withdrawal.iban ? `${withdrawal.iban.slice(0, 4)}...${withdrawal.iban.slice(-4)}` : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell>
                        {withdrawal.processed_at 
                          ? format(new Date(withdrawal.processed_at), "d MMM yyyy", { locale: fr })
                          : "-"
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Aucun retrait effectué
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Wallet;
