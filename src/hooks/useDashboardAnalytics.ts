const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export interface MonthlyPoint {
  month: string;
  [key: string]: string | number;
}

/**
 * Aggregate rows into the last 6 months (amounts already expressed in euros).
 * `series` maps a chart key to an accessor returning the euro amount for a row.
 */
export function monthlySeries<T>(
  rows: T[],
  getDate: (row: T) => string | null | undefined,
  series: Record<string, (row: T) => number>,
  monthsBack = 6,
): MonthlyPoint[] {
  const now = new Date();
  const buckets: Record<string, Record<string, number>> = {};
  const order: string[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    order.push(key);
    buckets[key] = Object.fromEntries(Object.keys(series).map(k => [k, 0]));
  }

  rows.forEach(row => {
    const raw = getDate(row);
    if (!raw) return;
    const d = new Date(raw);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) return;
    Object.entries(series).forEach(([k, fn]) => {
      buckets[key][k] += fn(row) || 0;
    });
  });

  return order.map(key => {
    const [, month] = key.split("-");
    const point: MonthlyPoint = { month: MONTHS[parseInt(month, 10) - 1] };
    Object.entries(buckets[key]).forEach(([k, v]) => { point[k] = Math.round(v); });
    return point;
  });
}

export function trendFrom(data: MonthlyPoint[], key: string) {
  const last = Number(data[data.length - 1]?.[key] || 0);
  const prev = Number(data[data.length - 2]?.[key] || 0);
  const change = prev > 0 ? ((last - prev) / prev) * 100 : last > 0 ? 100 : 0;
  return { up: change >= 0, percent: Math.abs(change).toFixed(1) };
}

export const euros = (n: number) =>
  `${Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`;
