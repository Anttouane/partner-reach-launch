import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface Kpi {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}

const KpiTiles = ({ items }: { items: Kpi[] }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {items.map((k, i) => (
      <motion.div
        key={k.label}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
      >
        <Card className="h-full">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <k.icon className="h-4 w-4" />
              <span className="text-sm">{k.label}</span>
            </div>
            <div className="text-2xl font-bold">{k.value}</div>
            {k.hint && <p className="text-xs text-muted-foreground mt-1">{k.hint}</p>}
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </div>
);

export default KpiTiles;
