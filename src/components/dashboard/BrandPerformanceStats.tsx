import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Users, CreditCard, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface BrandPerformanceStatsProps {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalSpent: number;
  totalCreatorsWorkedWith: number;
}

const BrandPerformanceStats = ({
  totalContracts,
  activeContracts,
  completedContracts,
  totalSpent,
  totalCreatorsWorkedWith,
}: BrandPerformanceStatsProps) => {
  const completionRate = totalContracts > 0 ? (completedContracts / totalContracts) * 100 : 0;

  const stats = [
    {
      icon: FileText,
      label: "Contrats actifs",
      value: activeContracts.toString(),
      progress: activeContracts * 20,
      color: "primary",
      description: `${totalContracts} contrats au total`,
    },
    {
      icon: Users,
      label: "Créateurs",
      value: totalCreatorsWorkedWith.toString(),
      progress: Math.min(totalCreatorsWorkedWith * 15, 100),
      color: "secondary",
      description: "Collaborations uniques",
    },
    {
      icon: TrendingUp,
      label: "Taux de complétion",
      value: `${completionRate.toFixed(0)}%`,
      progress: completionRate,
      color: "accent",
      description: `${completedContracts} partenariats réussis`,
    },
    {
      icon: CreditCard,
      label: "Investissement total",
      value: `${(totalSpent / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €`,
      progress: Math.min(totalSpent / 100000, 100),
      color: "secondary",
      description: "Budget partenariats",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Performance Partenariats</CardTitle>
        <CardDescription>Vos statistiques de collaboration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="space-y-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <span className="text-sm font-bold">{stat.value}</span>
            </div>
            <Progress 
              value={stat.progress} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BrandPerformanceStats;
