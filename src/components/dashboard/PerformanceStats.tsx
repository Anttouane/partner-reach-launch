import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Users, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface PerformanceStatsProps {
  totalPitches: number;
  acceptedPitches: number;
  totalCollaborations: number;
  averageRating: number;
  responseRate: number;
}

const PerformanceStats = ({
  totalPitches,
  acceptedPitches,
  totalCollaborations,
  averageRating,
  responseRate,
}: PerformanceStatsProps) => {
  const acceptanceRate = totalPitches > 0 ? (acceptedPitches / totalPitches) * 100 : 0;

  const stats = [
    {
      icon: Target,
      label: "Taux d'acceptation",
      value: `${acceptanceRate.toFixed(0)}%`,
      progress: acceptanceRate,
      color: "primary",
      description: `${acceptedPitches} sur ${totalPitches} pitches`,
    },
    {
      icon: Users,
      label: "Collaborations",
      value: totalCollaborations.toString(),
      progress: Math.min(totalCollaborations * 10, 100),
      color: "secondary",
      description: "Partenariats réalisés",
    },
    {
      icon: Star,
      label: "Note moyenne",
      value: averageRating > 0 ? averageRating.toFixed(1) : "N/A",
      progress: averageRating * 20,
      color: "accent",
      description: averageRating > 0 ? "Sur 5 étoiles" : "Pas encore noté",
    },
    {
      icon: Zap,
      label: "Taux de réponse",
      value: `${responseRate.toFixed(0)}%`,
      progress: responseRate,
      color: "primary",
      description: "Réponses aux messages",
    },
  ];

  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Performance</CardTitle>
        <CardDescription>Vos statistiques clés</CardDescription>
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

export default PerformanceStats;
