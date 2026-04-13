import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MessageCircle, User, PlusCircle, Eye, EyeOff } from "lucide-react";
import { usePrivacy } from "@/contexts/PrivacyContext";
import MonthlyReport from "@/components/dashboard/MonthlyReport";
import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import TransactionList from "@/components/dashboard/TransactionList";
import GoalsSection from "@/components/dashboard/GoalsSection";
import BottomNav from "@/components/dashboard/BottomNav";

export interface Transaction {
  id: string;
  type: string | null;
  description: string;
  amount: number;
  category: string | null;
  created_at: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { privacyMode, togglePrivacy } = usePrivacy();
  const [reportOpen, setReportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const { income, expenses, balance } = useFinancialSummary(transactions);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const firstName = (profile?.full_name || "Usuário").split(" ")[0];

  return (
    <div className="min-h-screen pb-24 md:pb-24">
      <header className="sticky top-0 z-10 glass px-4 sm:px-6 py-4 flex flex-row items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Bem-vindo de volta</p>
          <h1 className="text-lg font-bold truncate">Olá, {firstName} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Desktop-only buttons */}
          <div className="hidden md:block">
            <MonthlyReport transactions={transactions} />
          </div>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setAddOpen(true)} title="Lançamento Manual">
            <PlusCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => navigate("/perfil")}>
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={togglePrivacy} title={privacyMode ? "Mostrar valores" : "Ocultar valores"}>
            {privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6 max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <SummaryCards income={income} expenses={expenses} balance={balance} />
            <ExpenseChart transactions={transactions} />
            <TransactionList transactions={transactions.slice(0, 5)} />
            <GoalsSection />
          </>
        )}
      </main>

      {/* Floating chat button: only on desktop */}
      <button
        onClick={() => navigate("/chat")}
        className="hidden md:flex fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg shadow-primary/30 hover:scale-105 transition-transform items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Bottom nav: only on mobile */}
      <BottomNav onReportClick={() => setReportOpen(true)} onAddClick={() => setAddOpen(true)} />

      {/* Report dialog controlled from bottom nav */}
      <MonthlyReport transactions={transactions} open={reportOpen} onOpenChange={setReportOpen} />

      {/* Add transaction modal */}
      <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
};

export default Dashboard;
