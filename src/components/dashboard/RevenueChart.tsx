import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Payment {
  net_amount: number;
  created_at: string;
}

interface RevenueChartProps {
  payments: Payment[];
}

const RevenueChart = ({ payments }: RevenueChartProps) => {
  const { chartData, trend, percentChange } = useMemo(() => {
    // Group payments by month
    const monthlyData: Record<string, number> = {};
    
    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }

    // Sum payments by month
    payments.forEach(payment => {
      const date = new Date(payment.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthlyData) {
        monthlyData[key] += payment.net_amount;
      }
    });

    // Convert to chart data
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const data = Object.entries(monthlyData).map(([key, revenue]) => {
      const [, month] = key.split('-');
      return {
        month: months[parseInt(month) - 1],
        revenue: revenue,
      };
    });

    // Calculate trend
    const lastMonth = data[data.length - 1]?.revenue || 0;
    const previousMonth = data[data.length - 2]?.revenue || 0;
    const change = previousMonth > 0 
      ? ((lastMonth - previousMonth) / previousMonth) * 100 
      : lastMonth > 0 ? 100 : 0;

    return {
      chartData: data,
      trend: change >= 0 ? 'up' : 'down',
      percentChange: Math.abs(change).toFixed(1),
    };
  }, [payments]);

  const chartConfig = {
    revenue: {
      label: "Revenus",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Évolution des revenus</CardTitle>
            <CardDescription>Les 6 derniers mois</CardDescription>
          </div>
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{percentChange}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}€`}
              width={50}
            />
            <ChartTooltip 
              content={<ChartTooltipContent formatter={(value) => `${value}€`} />} 
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
