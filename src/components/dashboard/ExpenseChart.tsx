import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Moradia", value: 1800 },
  { name: "Alimentação", value: 1200 },
  { name: "Transporte", value: 650 },
  { name: "Lazer", value: 480 },
  { name: "Outros", value: 1100 },
];

const COLORS = [
  "hsl(239, 84%, 67%)",
  "hsl(160, 84%, 39%)",
  "hsl(25, 95%, 53%)",
  "hsl(280, 70%, 60%)",
  "hsl(200, 70%, 55%)",
];

const ExpenseChart = () => (
  <div className="glass rounded-2xl p-5 space-y-4">
    <h2 className="text-base font-semibold">Despesas por Categoria</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", color: "hsl(213, 31%, 91%)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default ExpenseChart;
