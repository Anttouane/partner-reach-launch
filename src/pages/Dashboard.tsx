import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonStatCard } from "@/components/ui/skeleton-card";
import { Search, MessageSquare, TrendingUp, Wallet, Eye, Calendar, ArrowRight, Sparkles, Building2, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import RevenueChart from "@/components/dashboard/RevenueChart";
import PerformanceStats from "@/components/dashboard/PerformanceStats";
import SpendingChart from "@/components/dashboard/SpendingChart";
import BrandPerformanceStats from "@/components/dashboard/BrandPerformanceStats";
import { ContractList } from "@/components/contracts/ContractList";

interface DashboardStats {
  opportunities: number;
  unreadMessages: number;
  earnings: number;
  pitches: number;
  profileViews: number;
  totalSpent: number;
}

interface Payment {
  net_amount: number;
  created_at: string;
}

interface BrandPayment {
  amount: number;
  created_at: string;
}

interface CreatorStats {
  totalPitches: number;
  acceptedPitches: number;
  totalCollaborations: number;
  averageRating: number;
  responseRate: number;
}

interface BrandStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalSpent: number;
  totalCreatorsWorkedWith: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [brandPayments, setBrandPayments] = useState<BrandPayment[]>([]);
  const [creatorStats, setCreatorStats] = useState<CreatorStats>({
    totalPitches: 0,
    acceptedPitches: 0,
    totalCollaborations: 0,
    averageRating: 0,
    responseRate: 0,
  });
  const [brandStats, setBrandStats] = useState<BrandStats>({
    totalContracts: 0,
    activeContracts: 0,
    completedContracts: 0,
    totalSpent: 0,
    totalCreatorsWorkedWith: 0,
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
      await loadDashboardData(session.user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadDashboardData = async (currentUser: User) => {
    const userType = currentUser.user_metadata?.user_type || "creator";
    
    try {
      // Load stats in parallel
      const [opportunitiesRes, messagesRes, paymentsRes, pitchesRes, brandPaymentsRes] = await Promise.all([
        supabase.from("brand_opportunities").select("id", { count: "exact" }),
        supabase.from("messages")
          .select("id", { count: "exact" })
          .eq("read", false),
        supabase.from("payments")
          .select("net_amount")
          .eq("payee_id", currentUser.id)
          .eq("status", "completed"),
        supabase.from("pitches").select("id", { count: "exact" }),
        supabase.from("payments")
          .select("amount")
          .eq("payer_id", currentUser.id)
          .eq("status", "completed"),
      ]);

      const totalEarnings = paymentsRes.data?.reduce((sum, p) => sum + (p.net_amount || 0), 0) || 0;
      const totalSpent = brandPaymentsRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setStats({
        opportunities: opportunitiesRes.count || 0,
        unreadMessages: messagesRes.count || 0,
        earnings: totalEarnings,
        pitches: pitchesRes.count || 0,
        profileViews: Math.floor(Math.random() * 50) + 10,
        totalSpent: totalSpent,
      });

      if (userType === "creator") {
        // Get all payments for chart
        const { data: allPayments } = await supabase
          .from("payments")
          .select("net_amount, created_at")
          .eq("payee_id", currentUser.id)
          .eq("status", "completed")
          .order("created_at", { ascending: true });
        
        setPayments(allPayments || []);

        // Calculate creator stats
        const { data: userPitches } = await supabase
          .from("pitches")
          .select("id, status")
          .eq("creator_id", currentUser.id);

        const totalUserPitches = userPitches?.length || 0;
        const acceptedUserPitches = userPitches?.filter(p => p.status === "accepted").length || 0;
        const totalCollabs = paymentsRes.data?.length || 0;

        const { count: receivedCount } = await supabase
          .from("messages")
          .select("id", { count: "exact" })
          .neq("sender_id", currentUser.id);

        const { count: sentCount } = await supabase
          .from("messages")
          .select("id", { count: "exact" })
          .eq("sender_id", currentUser.id);

        const responseRate = receivedCount && receivedCount > 0 
          ? Math.min(((sentCount || 0) / receivedCount) * 100, 100) 
          : 85;

        setCreatorStats({
          totalPitches: totalUserPitches,
          acceptedPitches: acceptedUserPitches,
          totalCollaborations: totalCollabs,
          averageRating: 4.5,
          responseRate: responseRate,
        });
      } else {
        // Brand-specific data
        const { data: allBrandPayments } = await supabase
          .from("payments")
          .select("amount, created_at, payee_id")
          .eq("payer_id", currentUser.id)
          .eq("status", "completed")
          .order("created_at", { ascending: true });
        
        setBrandPayments(allBrandPayments || []);

        // Get contracts stats
        const { data: contracts } = await supabase
          .from("contracts")
          .select("id, status, creator_id")
          .eq("brand_id", currentUser.id);

        const totalContracts = contracts?.length || 0;
        const activeContracts = contracts?.filter(c => c.status === "active" || c.status === "signed").length || 0;
        const completedContracts = contracts?.filter(c => c.status === "completed").length || 0;
        
        // Count unique creators
        const uniqueCreators = new Set(contracts?.map(c => c.creator_id) || []);
        const uniquePayees = new Set(allBrandPayments?.map(p => p.payee_id) || []);
        const allUniqueCreators = new Set([...uniqueCreators, ...uniquePayees]);

        setBrandStats({
          totalContracts,
          activeContracts,
          completedContracts,
          totalSpent,
          totalCreatorsWorkedWith: allUniqueCreators.size,
        });
      }

      // Load recent activity
      const { data: recentPayments } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          status,
          created_at,
          description
        `)
        .or(`payer_id.eq.${currentUser.id},payee_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false })
        .limit(5);

      const activities = (recentPayments || []).map(p => ({
        id: p.id,
        type: "payment",
        title: p.status === "completed" ? "Paiement reçu" : "Paiement en attente",
        description: p.description || `${p.amount}€`,
        time: formatTimeAgo(new Date(p.created_at)),
        status: p.status,
      }));

      setRecentActivity(activities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
    if (hours > 0) return `Il y a ${hours}h`;
    return "À l'instant";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
        <Header user={null} />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-64 rounded skeleton-shimmer" />
            <div className="h-4 w-96 rounded skeleton-shimmer" />
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        </main>
      </div>
    );
  }

  const userType = user?.user_metadata?.user_type || "creator";
  const isCreator = userType === "creator";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            {isCreator ? (
              <Sparkles className="h-8 w-8 text-primary" />
            ) : (
              <Building2 className="h-8 w-8 text-secondary" />
            )}
            <h2 className="text-3xl font-bold">
              {isCreator ? "Dashboard Créateur" : "Dashboard Marque"}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {isCreator
              ? "Gérez vos collaborations et découvrez de nouvelles opportunités"
              : "Trouvez les créateurs parfaits pour vos campagnes"}
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              icon={<Search className="h-6 w-6" />}
              title={isCreator ? "Opportunités" : "Créateurs disponibles"}
              value={isCreator ? stats?.opportunities.toString() || "0" : stats?.pitches.toString() || "0"}
              description="Disponibles maintenant"
              color="primary"
              onClick={() => navigate("/discover")}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="Messages"
              value={stats?.unreadMessages.toString() || "0"}
              description="Non lus"
              color="secondary"
              onClick={() => navigate("/messages")}
              highlight={stats?.unreadMessages ? stats.unreadMessages > 0 : false}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              icon={isCreator ? <Wallet className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
              title={isCreator ? "Revenus" : "Dépenses totales"}
              value={isCreator 
                ? `${((stats?.earnings || 0) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €` 
                : `${((stats?.totalSpent || 0) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`}
              description={isCreator ? "Total gagné" : "Budget partenariats"}
              color="accent"
              onClick={isCreator ? () => navigate("/wallet") : undefined}
            />
          </motion.div>
        </motion.div>

        {/* Creator Analytics Section */}
        {isCreator && (
          <motion.div 
            className="grid lg:grid-cols-2 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <RevenueChart payments={payments} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <PerformanceStats {...creatorStats} />
            </motion.div>
          </motion.div>
        )}

        {/* Brand Analytics Section */}
        {!isCreator && (
          <motion.div 
            className="grid lg:grid-cols-2 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <SpendingChart payments={brandPayments} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <BrandPerformanceStats {...brandStats} />
            </motion.div>
          </motion.div>
        )}

        {/* Contracts Section */}
        <motion.div
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mes Contrats</CardTitle>
                  <CardDescription>
                    {isCreator ? "Vos partenariats en cours" : "Vos collaborations avec les créateurs"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/messages")}>
                  Voir tout
                </Button>
              </CardHeader>
              <CardContent>
                {user && <ContractList userId={user.id} limit={5} />}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid lg:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Activité récente</CardTitle>
                  <CardDescription>Vos dernières interactions</CardDescription>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Aucune activité récente</p>
                    <p className="text-sm mt-1">Commencez par explorer les {isCreator ? "opportunités" : "créateurs"}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <ActivityItem
                        key={activity.id}
                        title={activity.title}
                        description={activity.description}
                        time={activity.time}
                        status={activity.status}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isCreator ? <Sparkles className="h-5 w-5 text-primary" /> : <Building2 className="h-5 w-5 text-secondary" />}
                  Actions rapides
                </CardTitle>
                <CardDescription>
                  {isCreator ? "Développez votre activité" : "Lancez une campagne"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between group"
                  onClick={() => navigate("/discover")}
                >
                  <span>Explorer les {isCreator ? "opportunités" : "créateurs"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between group"
                  onClick={() => navigate("/profile")}
                >
                  <span>Compléter mon profil</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                {isCreator ? (
                  <Button 
                    variant="outline" 
                    className="w-full justify-between group"
                    onClick={() => navigate("/create-pitch")}
                  >
                    <span>Créer un pitch</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full justify-between group"
                    onClick={() => navigate("/create-opportunity")}
                  >
                    <span>Publier une opportunité</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color?: "primary" | "secondary" | "accent";
  onClick?: () => void;
  highlight?: boolean;
}

const StatCard = ({ icon, title, value, description, color = "primary", onClick, highlight }: StatCardProps) => {
  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
  };

  return (
    <Card 
      className={`stat-card ${onClick ? "cursor-pointer" : ""} ${highlight ? "ring-2 ring-secondary/50" : ""}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`${colorClasses[color]} p-2 rounded-lg bg-current/10`}>
            {icon}
          </div>
        </div>
        {highlight && (
          <div className="absolute top-2 right-2">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  status?: string;
  index: number;
}

const ActivityItem = ({ title, description, time, status, index }: ActivityItemProps) => {
  const statusColors: Record<string, string> = {
    completed: "bg-green-500",
    pending: "bg-yellow-500",
    failed: "bg-red-500",
  };

  return (
    <motion.div 
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className={`w-2 h-2 rounded-full mt-2 ${statusColors[status || ""] || "bg-primary"}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <p className="text-xs text-muted-foreground whitespace-nowrap">{time}</p>
    </motion.div>
  );
};

export default Dashboard;
