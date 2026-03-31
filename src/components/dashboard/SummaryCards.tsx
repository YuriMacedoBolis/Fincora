import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

const cards = [
  {
    title: "Receitas",
    value: "R$ 8.450,00",
    icon: TrendingUp,
    colorClass: "text-success",
    bgClass: "bg-success/10",
  },
  {
    title: "Despesas",
    value: "R$ 5.230,00",
    icon: TrendingDown,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
  },
  {
    title: "Saldo do Mês",
    value: "R$ 3.220,00",
    icon: Wallet,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
];

const SummaryCards = () => (
  <div className="grid gap-4">
    {cards.map((card) => (
      <div key={card.title} className="glass rounded-2xl p-5 flex items-center gap-4">
        <div className={`${card.bgClass} rounded-xl p-3`}>
          <card.icon className={`w-6 h-6 ${card.colorClass}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{card.title}</p>
          <p className={`text-xl font-bold ${card.colorClass}`}>{card.value}</p>
        </div>
      </div>
    ))}
  </div>
);

export default SummaryCards;
