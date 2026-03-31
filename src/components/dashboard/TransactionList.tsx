import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "@/pages/Dashboard";

interface TransactionListProps {
  transactions: Transaction[];
}

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const TransactionList = ({ transactions }: TransactionListProps) => (
  <div className="glass rounded-2xl p-5 space-y-4">
    <h2 className="text-base font-semibold">Últimas Transações</h2>
    {transactions.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma transação encontrada.</p>
    ) : (
      <div className="space-y-3">
        {transactions.map((t) => {
          const isIncome = t.type === "income";
          const date = t.created_at
            ? new Date(t.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
            : "";
          return (
            <div key={t.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 ${isIncome ? "bg-success/10" : "bg-warning/10"}`}>
                  {isIncome ? (
                    <ArrowDownLeft className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-warning" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{date}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${isIncome ? "text-success" : "text-warning"}`}>
                {isIncome ? "+" : "-"}{formatBRL(Math.abs(t.amount))}
              </span>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default TransactionList;
