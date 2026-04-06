import { useMemo, useState } from "react";
import { FileText, TrendingUp, TrendingDown, Wallet, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction } from "@/pages/Dashboard";

interface MonthlyReportProps {
  transactions: Transaction[];
}

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MonthlyReport = ({ transactions, open: controlledOpen, onOpenChange }: MonthlyReportProps & { open?: boolean; onOpenChange?: (v: boolean) => void }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const { income, expenses, balance, monthlyTransactions } = useFinancialSummary(transactions);

  const topCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    monthlyTransactions
      .filter((t) => t.type === "saida")
      .forEach((t) => {
        const cat = t.category || "Sem categoria";
        categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(Number(t.amount));
      });

    let top = { name: "—", value: 0 };
    for (const [name, value] of Object.entries(categoryMap)) {
      if (value > top.value) top = { name, value };
    }
    return top;
  }, [monthlyTransactions]);

  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <>
      {controlledOpen === undefined && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-1.5"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Relatório do Mês</span>
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              Relatório — {monthName}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="rounded-xl bg-emerald-500/10 p-4 space-y-1">
              <div className="flex items-center gap-2 text-emerald-500">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Entradas</span>
              </div>
              <p className="text-lg font-bold text-emerald-500">
                {formatBRL(income)}
              </p>
            </div>

            <div className="rounded-xl bg-orange-500/10 p-4 space-y-1">
              <div className="flex items-center gap-2 text-orange-500">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">Saídas</span>
              </div>
              <p className="text-lg font-bold text-orange-500">
                {formatBRL(report.expenses)}
              </p>
            </div>

            <div className="rounded-xl bg-primary/10 p-4 space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-medium">Saldo Final</span>
              </div>
              <p className="text-lg font-bold text-primary">
                {formatBRL(report.balance)}
              </p>
            </div>

            <div className="rounded-xl bg-secondary p-4 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="text-xs font-medium">Maior Gasto</span>
              </div>
              <p className="text-sm font-bold text-foreground">
                {report.topCategory.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBRL(report.topCategory.value)}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonthlyReport;
