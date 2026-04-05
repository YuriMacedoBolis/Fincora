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

  const report = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthly = transactions.filter((t) => {
      if (!t.created_at) return false;
      const d = new Date(t.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const income = monthly
      .filter((t) => t.type === "entrada")
      .reduce((s, t) => s + Number(t.amount), 0);

    const expenses = monthly
      .filter((t) => t.type === "saida")
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

    const categoryMap: Record<string, number> = {};
    monthly
      .filter((t) => t.type === "saida")
      .forEach((t) => {
        const cat = t.category || "Sem categoria";
        categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(Number(t.amount));
      });

    let topCategory = { name: "—", value: 0 };
    for (const [name, value] of Object.entries(categoryMap)) {
      if (value > topCategory.value) topCategory = { name, value };
    }

    return { income, expenses, balance: income - expenses, topCategory };
  }, [transactions]);

  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">Relatório do Mês</span>
      </Button>

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
                {formatBRL(report.income)}
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
