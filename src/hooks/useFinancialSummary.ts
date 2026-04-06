import { useMemo } from "react";
import type { Transaction } from "@/pages/Dashboard";

export function useFinancialSummary(transactions: Transaction[]) {
  return useMemo(() => {
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

    return { income, expenses, balance: income - expenses, monthlyTransactions: monthly };
  }, [transactions]);
}
