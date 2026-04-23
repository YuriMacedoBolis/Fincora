import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { usePrivacy } from "@/contexts/PrivacyContext";

interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
}

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const SummaryCards = ({ income, expenses, balance }: SummaryCardsProps) => {
  const { maskValue } = usePrivacy();
  const cards = [
    { title: "Saldo do Mês", value: maskValue(formatBRL(balance)), icon: Wallet, colorClass: "text-primary", bgClass: "bg-primary/10" },
    { title: "Receitas", value: maskValue(formatBRL(income)), icon: TrendingUp, colorClass: "text-success", bgClass: "bg-success/10" },
    { title: "Despesas", value: maskValue(formatBRL(expenses)), icon: TrendingDown, colorClass: "text-warning", bgClass: "bg-warning/10" },
  ];

  return (
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
};

export default SummaryCards;
