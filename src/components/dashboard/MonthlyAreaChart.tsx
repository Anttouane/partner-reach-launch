import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MonthlyPoint, trendFrom } from "@/hooks/useDashboardAnalytics";

interface SeriesDef {
  key: string;
  label: string;
  color: string;
}

interface MonthlyAreaChartProps {
  title: string;
  description?: string;
  data: MonthlyPoint[];
  series: SeriesDef[];
  trendKey?: string;
}

const MonthlyAreaChart = ({ title, description, data, series, trendKey }: MonthlyAreaChartProps) => {
  const trend = trendKey ? trendFrom(data, trendKey) : null;

  const chartConfig = Object.fromEntries(
    series.map(s => [s.key, { label: s.label, color: s.color }]),
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend.up ? "text-primary" : "text-muted-foreground"}`}>
              {trend.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{trend.percent}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {series.map(s => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `${v}€`}
              width={55}
            />
            <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => `${value}€ ${chartConfig[name as string]?.label ?? ""}`} />} />
            {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
            {series.map(s => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#grad-${s.key})`}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyAreaChart;
