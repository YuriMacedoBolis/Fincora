import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Transaction } from "@/types";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { format, subDays, subMonths, subYears, startOfDay, startOfMonth, startOfYear, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

type Timeframe = "weekly" | "monthly" | "yearly";

interface Props {
  transactions: Transaction[];
}

const INCOME_COLOR = "#8CC850";
const EXPENSE_COLOR = "#FF6400";

const TIMEFRAME_OPTIONS: { key: Timeframe; label: string }[] = [
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensal" },
  { key: "yearly", label: "Anual" },
];

function buildChartData(transactions: Transaction[], timeframe: Timeframe) {
  const now = new Date();

  if (timeframe === "weekly") {
    const days: { label: string; start: Date; end: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const start = startOfDay(d);
      const end = i === 0 ? now : startOfDay(subDays(now, i - 1));
      days.push({ label: format(d, "EEE", { locale: ptBR }), start, end });
    }
    return days.map(({ label, start, end }) => {
      let income = 0;
      let expense = 0;
      transactions.forEach((t) => {
        const date = new Date(t.created_at || "");
        if (date >= start && date < end) {
          if (t.type === "entrada") income += Math.abs(t.amount);
          else if (t.type === "saida") expense += Math.abs(t.amount);
        }
      });
      return { name: label, Receitas: income, Despesas: expense };
    });
  }

  if (timeframe === "monthly") {
    const months: { label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const start = startOfMonth(d);
      const end = i === 0 ? now : startOfMonth(subMonths(now, i - 1));
      months.push({ label: format(d, "MMM", { locale: ptBR }), start, end });
    }
    return months.map(({ label, start, end }) => {
      let income = 0;
      let expense = 0;
      transactions.forEach((t) => {
        const date = new Date(t.created_at || "");
        if (date >= start && date < end) {
          if (t.type === "entrada") income += Math.abs(t.amount);
          else if (t.type === "saida") expense += Math.abs(t.amount);
        }
      });
      return { name: label, Receitas: income, Despesas: expense };
    });
  }

  // yearly
  const years: { label: string; start: Date; end: Date }[] = [];
  for (let i = 4; i >= 0; i--) {
    const d = subYears(now, i);
    const start = startOfYear(d);
    const end = i === 0 ? now : startOfYear(subYears(now, i - 1));
    years.push({ label: format(d, "yyyy"), start, end });
  }
  return years.map(({ label, start, end }) => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      const date = new Date(t.created_at || "");
      if (date >= start && date < end) {
        if (t.type === "entrada") income += Math.abs(t.amount);
        else if (t.type === "saida") expense += Math.abs(t.amount);
      }
    });
    return { name: label, Receitas: income, Despesas: expense };
  });
}

const FinancialEvolutionChart = ({ transactions }: Props) => {
  const [timeframe, setTimeframe] = useState<Timeframe>("monthly");
  const { maskValue } = usePrivacy();

  const data = useMemo(() => buildChartData(transactions, timeframe), [transactions, timeframe]);

  const hasData = data.some((d) => d.Receitas > 0 || d.Despesas > 0);

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-base font-semibold">Evolução Financeira</h2>
        <div className="flex rounded-lg border border-border overflow-hidden text-xs">
          {TIMEFRAME_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeframe(key)}
              className={`px-3 py-1.5 transition-colors ${
                timeframe === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Sem dados para o período selecionado.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={2} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(v: number) =>
                maskValue(
                  v >= 1000
                    ? `${(v / 1000).toFixed(0)}k`
                    : v.toString()
                )
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number, name: string) => [
                maskValue(
                  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                ),
                name,
              ]}
              cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="Receitas" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default FinancialEvolutionChart;
