import type { Transaction } from "@/types";

/**
 * Pure financial utility functions.
 * Keep React components thin — do all calculations here.
 */

export const isIncome = (t: Transaction) => t.type === "entrada";
export const isExpense = (t: Transaction) => t.type === "saida";

export const sumIncome = (txs: Transaction[]): number =>
  txs.filter(isIncome).reduce((s, t) => s + Number(t.amount), 0);

export const sumExpenses = (txs: Transaction[]): number =>
  txs.filter(isExpense).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

export const calcBalance = (txs: Transaction[]): number =>
  sumIncome(txs) - sumExpenses(txs);

/** Filter transactions belonging to a given month/year (uses created_at). */
export const filterByMonth = (
  txs: Transaction[],
  month: number,
  year: number,
): Transaction[] =>
  txs.filter((t) => {
    if (!t.created_at) return false;
    const d = new Date(t.created_at);
    return d.getMonth() === month && d.getFullYear() === year;
  });

/** Aggregate expenses by category. Returns { category: total } map. */
export const groupExpensesByCategory = (
  txs: Transaction[],
): Record<string, number> => {
  const map: Record<string, number> = {};
  txs.filter(isExpense).forEach((t) => {
    const key = t.category || "Sem categoria";
    map[key] = (map[key] || 0) + Math.abs(Number(t.amount));
  });
  return map;
};

/** Aggregate incomes by category. */
export const groupIncomeByCategory = (
  txs: Transaction[],
): Record<string, number> => {
  const map: Record<string, number> = {};
  txs.filter(isIncome).forEach((t) => {
    const key = t.category || "Sem categoria";
    map[key] = (map[key] || 0) + Number(t.amount);
  });
  return map;
};

/** Top N expense categories sorted descending. */
export const topExpenseCategories = (
  txs: Transaction[],
  limit = 3,
): Array<[string, number]> =>
  Object.entries(groupExpensesByCategory(txs))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

/** Single largest expense transaction (or null). */
export const largestExpense = (txs: Transaction[]): Transaction | null => {
  const exits = txs.filter(isExpense);
  if (!exits.length) return null;
  return exits.reduce((max, t) =>
    Math.abs(Number(t.amount)) > Math.abs(Number(max.amount)) ? t : max,
  );
};

/** Percent change between current and previous values. Null if previous is 0. */
export const percentChange = (current: number, previous: number): number | null => {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
};

/** Daily average spend so far this month, based on today's day-of-month. */
export const dailyAverage = (totalExpenses: number, dayOfMonth: number): number =>
  dayOfMonth > 0 ? totalExpenses / dayOfMonth : 0;

/** Format a numeric value as Brazilian Real currency. */
export const formatBRL = (value: number): string =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
