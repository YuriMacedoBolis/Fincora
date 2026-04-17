import { useMemo } from "react";
import type { Transaction } from "@/types";
import { filterByMonth, sumIncome, sumExpenses } from "@/lib/finance";

export function useFinancialSummary(transactions: Transaction[]) {
  return useMemo(() => {
    const now = new Date();
    const monthly = filterByMonth(transactions, now.getMonth(), now.getFullYear());
    const income = sumIncome(monthly);
    const expenses = sumExpenses(monthly);
    return { income, expenses, balance: income - expenses, monthlyTransactions: monthly };
  }, [transactions]);
}
