import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingDown, TrendingUp, Flame, Zap, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, subDays, subMonths, startOfDay, startOfMonth, differenceInDays, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import BottomNav from "@/components/dashboard/BottomNav";

type Timeframe = "weekly" | "monthly";

interface Transaction {
  id: string;
  type: string | null;
  description: string;
  amount: number;
  category: string | null;
  created_at: string | null;
}

const INCOME_COLOR = "#8CC850";
const EXPENSE_COLOR = "#FF6400";

const TIMEFRAME_OPTIONS: { key: Timeframe; label: string }[] = [
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensal" },
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
      let income = 0, expense = 0;
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

  // monthly
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const start = startOfMonth(d);
    const end = i === 0 ? now : startOfMonth(subMonths(now, i - 1));
    months.push({ label: format(d, "MMM", { locale: ptBR }), start, end });
  }
  return months.map(({ label, start, end }) => {
    let income = 0, expense = 0;
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

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Analise = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { maskValue } = usePrivacy();
  const [timeframe, setTimeframe] = useState<Timeframe>("monthly");

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", user?.id, "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const chartData = useMemo(() => buildChartData(transactions, timeframe), [transactions, timeframe]);
  const hasChartData = chartData.some((d) => d.Receitas > 0 || d.Despesas > 0);

  // --- Insights ---
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));

  const currentMonthExpenses = useMemo(() =>
    transactions
      .filter((t) => t.type === "saida" && new Date(t.created_at || "") >= currentMonthStart)
      .reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions, currentMonthStart]
  );

  const prevMonthExpenses = useMemo(() =>
    transactions
      .filter((t) => {
        const d = new Date(t.created_at || "");
        return t.type === "saida" && d >= prevMonthStart && d < currentMonthStart;
      })
      .reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions, prevMonthStart, currentMonthStart]
  );

  const monthlyChangePercent = prevMonthExpenses > 0
    ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
    : null;

  // Top 3 categories
  const topCategories = useMemo(() => {
    const periodStart = timeframe === "weekly" ? subDays(now, 7) : currentMonthStart;
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type === "saida" && new Date(t.created_at || "") >= periodStart) {
        const cat = t.category || "Outros";
        map[cat] = (map[cat] || 0) + Math.abs(t.amount);
      }
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [transactions, timeframe, currentMonthStart]);

  // Daily spending pace
  const daysSoFar = Math.max(1, differenceInDays(now, currentMonthStart) + 1);
  const dailyAvg = currentMonthExpenses / daysSoFar;

  // Biggest single expense
  const biggestExpense = useMemo(() => {
    const periodStart = timeframe === "weekly" ? subDays(now, 7) : currentMonthStart;
    let biggest: Transaction | null = null;
    transactions.forEach((t) => {
      if (t.type === "saida" && new Date(t.created_at || "") >= periodStart) {
        if (!biggest || Math.abs(t.amount) > Math.abs(biggest.amount)) biggest = t;
      }
    });
    return biggest as Transaction | null;
  }, [transactions, timeframe, currentMonthStart]);

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 glass px-4 sm:px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Análise</h1>
      </header>

      <main className="px-5 py-6 space-y-5 max-w-lg mx-auto">
        {/* Evolution Chart */}
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

          {!hasChartData ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem dados para o período selecionado.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }} className="fill-muted-foreground" axisLine={false} tickLine={false} width={50}
                  tickFormatter={(v: number) => maskValue(v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString())}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
                  formatter={(value: number, name: string) => [maskValue(formatBRL(value)), name]}
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Receitas" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Insight: Monthly Comparison */}
        <div className="glass rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            {monthlyChangePercent !== null && monthlyChangePercent <= 0 ? (
              <TrendingDown className="w-5 h-5 text-[#8CC850]" />
            ) : (
              <TrendingUp className="w-5 h-5 text-[#FF6400]" />
            )}
            <h3 className="text-sm font-semibold">Comparativo Mensal</h3>
          </div>
          <p className="text-2xl font-bold">{maskValue(formatBRL(currentMonthExpenses))}</p>
          {monthlyChangePercent !== null ? (
            <p className="text-xs text-muted-foreground">
              {monthlyChangePercent <= 0 ? (
                <span className="text-[#8CC850] font-medium">{monthlyChangePercent.toFixed(1)}%</span>
              ) : (
                <span className="text-[#FF6400] font-medium">+{monthlyChangePercent.toFixed(1)}%</span>
              )}
              {" "}em relação ao mês anterior ({maskValue(formatBRL(prevMonthExpenses))})
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Sem dados do mês anterior para comparação.</p>
          )}
        </div>

        {/* Insight: Top 3 Categories */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF6400]" />
            <h3 className="text-sm font-semibold">Categorias Vilãs</h3>
          </div>
          {topCategories.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem gastos no período.</p>
          ) : (
            <div className="space-y-2">
              {topCategories.map(([cat, amount], i) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}º</span>
                    <span className="text-sm">{cat}</span>
                  </div>
                  <span className="text-sm font-semibold">{maskValue(formatBRL(amount))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insight: Daily Pace */}
        <div className="glass rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#8CC850]" />
            <h3 className="text-sm font-semibold">Ritmo de Gasto</h3>
          </div>
          <p className="text-2xl font-bold">{maskValue(formatBRL(dailyAvg))}<span className="text-sm font-normal text-muted-foreground"> /dia</span></p>
          <p className="text-xs text-muted-foreground">
            {dailyAvg < (prevMonthExpenses / 30 || Infinity) ? "Ótimo ritmo! Continue assim! 🚀" : "Mantenha o foco nos seus objetivos! 💪"}
          </p>
        </div>

        {/* Insight: Biggest Expense */}
        <div className="glass rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#FF6400]" />
            <h3 className="text-sm font-semibold">Maior Gasto do Período</h3>
          </div>
          {biggestExpense ? (
            <>
              <p className="text-2xl font-bold">{maskValue(formatBRL(Math.abs(biggestExpense.amount)))}</p>
              <p className="text-xs text-muted-foreground">
                {biggestExpense.description} • {biggestExpense.category || "Sem categoria"}
                {biggestExpense.created_at && ` • ${format(new Date(biggestExpense.created_at), "dd/MM", { locale: ptBR })}`}
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Sem gastos no período.</p>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Analise;
