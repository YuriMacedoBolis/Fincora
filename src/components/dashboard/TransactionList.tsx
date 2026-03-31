import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

const transactions = [
  { id: 1, desc: "Salário", amount: "+R$ 5.500,00", type: "income", date: "01/03" },
  { id: 2, desc: "Aluguel", amount: "-R$ 1.800,00", type: "expense", date: "05/03" },
  { id: 3, desc: "Freelance", amount: "+R$ 2.950,00", type: "income", date: "10/03" },
  { id: 4, desc: "Supermercado", amount: "-R$ 620,00", type: "expense", date: "12/03" },
  { id: 5, desc: "Uber", amount: "-R$ 85,00", type: "expense", date: "15/03" },
];

const TransactionList = () => (
  <div className="glass rounded-2xl p-5 space-y-4">
    <h2 className="text-base font-semibold">Últimas Transações</h2>
    <div className="space-y-3">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2 ${t.type === "income" ? "bg-success/10" : "bg-warning/10"}`}>
              {t.type === "income" ? (
                <ArrowDownLeft className="w-4 h-4 text-success" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-warning" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{t.desc}</p>
              <p className="text-xs text-muted-foreground">{t.date}</p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${t.type === "income" ? "text-success" : "text-warning"}`}>
            {t.amount}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default TransactionList;
