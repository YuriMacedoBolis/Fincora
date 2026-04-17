import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Transaction } from "@/types";
import { usePrivacy } from "@/contexts/PrivacyContext";

const COLORS = ["#6366F1", "#10B981", "#F97316", "#EF4444", "#8B5CF6", "#EC4899"];

interface ExpenseChartProps {
  transactions: Transaction[];
}

const ExpenseChart = ({ transactions }: ExpenseChartProps) => {
  const { maskValue } = usePrivacy();
  const expensesByCategory = transactions
    .filter((t) => t.type === "saida")
    .reduce<Record<string, number>>((acc, t) => {
      const cat = t.category || "Outros";
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

  const data = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="text-base font-semibold">Despesas por Categoria</h2>
        <p className="text-sm text-muted-foreground text-center py-4">Sem despesas registradas.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <h2 className="text-base font-semibold">Despesas por Categoria</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4} stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              maskValue(value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }))
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 justify-center">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseChart;
