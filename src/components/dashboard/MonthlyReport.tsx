import { useMemo, useRef, useState } from "react";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Tag,
  BarChart3,
  Calendar,
  Crown,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Transaction } from "@/pages/Dashboard";
import { usePrivacy } from "@/contexts/PrivacyContext";

interface MonthlyReportProps {
  transactions: Transaction[];
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MonthlyReport = ({ transactions, open: controlledOpen, onOpenChange }: MonthlyReportProps) => {
  const { maskValue } = usePrivacy();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const { income, expenses, balance, monthlyTransactions } = useFinancialSummary(transactions);

  // Previous month data
  const prevMonthData = useMemo(() => {
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const prevTx = transactions.filter((t) => {
      if (!t.created_at) return false;
      const d = new Date(t.created_at);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });
    return prevTx
      .filter((t) => t.type === "saida")
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  }, [transactions]);

  // Daily average spend
  const dailyAvg = useMemo(() => {
    const day = new Date().getDate();
    return day > 0 ? expenses / day : 0;
  }, [expenses]);

  // Top 3 expense categories
  const topCategories = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyTransactions
      .filter((t) => t.type === "saida")
      .forEach((t) => {
        const cat = t.category || "Sem categoria";
        map[cat] = (map[cat] || 0) + Math.abs(Number(t.amount));
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [monthlyTransactions]);

  // Largest single expense
  const largestExpense = useMemo(() => {
    const exits = monthlyTransactions.filter((t) => t.type === "saida");
    if (!exits.length) return null;
    return exits.reduce((max, t) =>
      Math.abs(Number(t.amount)) > Math.abs(Number(max.amount)) ? t : max
    );
  }, [monthlyTransactions]);

  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const monthDiff = prevMonthData > 0
    ? (((expenses - prevMonthData) / prevMonthData) * 100).toFixed(1)
    : null;

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    const element = reportRef.current;
    const origWidth = element.style.width;
    const origMaxWidth = element.style.maxWidth;
    const origMinHeight = element.style.minHeight;
    const origPadding = element.style.padding;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      element.style.width = "800px";
      element.style.maxWidth = "none";
      element.style.minHeight = "1131px";
      element.style.padding = "40px";

      const canvas = await html2canvas(element, {
        backgroundColor: "#05120D",
        scale: 2,
        useCORS: true,
        windowWidth: 800,
        width: 800,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      // Fill entire A4 with dark background
      pdf.setFillColor("#05120D");
      pdf.rect(0, 0, pdfW, pdfH, "F");

      const imgH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, imgH);
      pdf.save("Relatorio-FinCare.pdf");
    } catch (e) {
      console.error("PDF export failed", e);
    } finally {
      element.style.width = origWidth;
      element.style.maxWidth = origMaxWidth;
      element.style.minHeight = origMinHeight;
      element.style.padding = origPadding;
      setExporting(false);
    }
  };

  return (
    <>
      {controlledOpen === undefined && (
        <Button id="tour-report-btn" data-tour="report-btn" variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Relatório do Mês</span>
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 border-0 bg-transparent overflow-y-auto max-h-[90vh] [&>button]:hidden w-[95vw]">
          {/* Header bar outside the PDF area */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2 rounded-t-xl" style={{ background: "#05120D" }}>
            <h2 className="text-lg font-bold capitalize" style={{ color: "#F5EBE1" }}>
              Relatório — {monthName}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleExportPDF}
                disabled={exporting}
                className="gap-1.5 text-white border-0"
                style={{ background: "#FF6400" }}
              >
                <Download className="w-4 h-4" />
                {exporting ? "Gerando…" : "Baixar PDF"}
              </Button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                style={{ color: "#F5EBE1" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ---- PDF capture area ---- */}
          <div ref={reportRef} className="px-5 pb-5 space-y-5" style={{ background: "#05120D", color: "#F5EBE1" }}>
            {/* Section 1 — Visão Geral */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#8CC850" }}>
                Visão Geral
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Entradas */}
                <div className="rounded-xl p-4 space-y-1 border" style={{ background: "#0A1F17", borderColor: "#1a3a2a" }}>
                  <div className="flex items-center gap-2" style={{ color: "#8CC850" }}>
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">Entradas</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: "#8CC850" }}>
                    {maskValue(formatBRL(income))}
                  </p>
                </div>

                {/* Saídas */}
                <div className="rounded-xl p-4 space-y-1 border" style={{ background: "#0A1F17", borderColor: "#1a3a2a" }}>
                  <div className="flex items-center gap-2" style={{ color: "#FF6400" }}>
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs font-medium">Saídas</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: "#FF6400" }}>
                    {maskValue(formatBRL(expenses))}
                  </p>
                </div>

                {/* Saldo Final */}
                <div
                  className="rounded-xl p-4 space-y-1 border-2"
                  style={{
                    background: "#0A1F17",
                    borderColor: "#FF6400",
                    boxShadow: "0 0 20px rgba(255,100,0,0.15)",
                  }}
                >
                  <div className="flex items-center gap-2" style={{ color: "#F5EBE1" }}>
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs font-medium">Saldo Final</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: balance >= 0 ? "#8CC850" : "#FF6400" }}>
                    {maskValue(formatBRL(balance))}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 — Inteligência Financeira */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#8CC850" }}>
                Inteligência Financeira
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Comparativo Mensal */}
                <div className="rounded-xl p-4 border space-y-2" style={{ background: "#0A1F17", borderColor: "#1a3a2a" }}>
                  <div className="flex items-center gap-2" style={{ color: "#FF6400" }}>
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs font-semibold">Comparativo Mensal</span>
                  </div>
                  <p className="text-sm" style={{ color: "#F5EBE1" }}>
                    Mês atual: <strong>{maskValue(formatBRL(expenses))}</strong>
                  </p>
                  <p className="text-sm" style={{ color: "#9ca3af" }}>
                    Mês anterior: {maskValue(formatBRL(prevMonthData))}
                  </p>
                  {monthDiff !== null && (
                    <p className="text-xs font-semibold" style={{ color: Number(monthDiff) > 0 ? "#FF6400" : "#8CC850" }}>
                      {Number(monthDiff) > 0 ? "▲" : "▼"} {Math.abs(Number(monthDiff))}% em relação ao mês passado
                    </p>
                  )}
                </div>

                {/* Ritmo de Gasto */}
                <div className="rounded-xl p-4 border space-y-2" style={{ background: "#0A1F17", borderColor: "#1a3a2a" }}>
                  <div className="flex items-center gap-2" style={{ color: "#FF6400" }}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-semibold">Ritmo de Gasto</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: "#F5EBE1" }}>
                    {maskValue(formatBRL(dailyAvg))}
                  </p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    Média diária de gastos neste mês
                  </p>
                </div>

                {/* Categorias Vilãs */}
                <div className="rounded-xl p-4 border space-y-2" style={{ background: "#0A1F17", borderColor: "#1a3a2a" }}>
                  <div className="flex items-center gap-2" style={{ color: "#FF6400" }}>
                    <Tag className="w-4 h-4" />
                    <span className="text-xs font-semibold">Categorias Vilãs</span>
                  </div>
                  {topCategories.length > 0 ? (
                    <ul className="space-y-1.5">
                      {topCategories.map(([cat, val], i) => (
                        <li key={cat} className="flex items-center justify-between text-sm">
                          <span style={{ color: "#F5EBE1" }}>
                            {i + 1}. {cat}
                          </span>
                          <span className="font-semibold" style={{ color: "#FF6400" }}>
                            {maskValue(formatBRL(val))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm" style={{ color: "#9ca3af" }}>Sem dados</p>
                  )}
                </div>

                {/* Maior Gasto */}
                <div className="rounded-xl p-4 border space-y-2" style={{ background: "#0A1F17", borderColor: "#1a3a2a" }}>
                  <div className="flex items-center gap-2" style={{ color: "#FF6400" }}>
                    <Crown className="w-4 h-4" />
                    <span className="text-xs font-semibold">Maior Gasto do Período</span>
                  </div>
                  {largestExpense ? (
                    <>
                      <p className="text-lg font-bold" style={{ color: "#FF6400" }}>
                        {maskValue(formatBRL(Math.abs(Number(largestExpense.amount))))}
                      </p>
                      <p className="text-sm" style={{ color: "#F5EBE1" }}>{largestExpense.description}</p>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>
                        {largestExpense.category || "Sem categoria"} •{" "}
                        {largestExpense.created_at
                          ? new Date(largestExpense.created_at).toLocaleDateString("pt-BR")
                          : "—"}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: "#9ca3af" }}>Nenhuma saída registrada</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer watermark for PDF */}
            <p className="text-center text-[10px] pt-2" style={{ color: "#4a5568" }}>
              Gerado por FinCare • {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonthlyReport;
