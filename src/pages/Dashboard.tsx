import { useNavigate } from "react-router-dom";
import { LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import TransactionList from "@/components/dashboard/TransactionList";

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

  const income = transactions
    .filter((t) => t.type === "entrada")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === "saida")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const balance = income - expenses;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const fullName = user?.user_metadata?.full_name || "Usuário";

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-10 glass px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Bem-vindo de volta</p>
          <h1 className="text-lg font-bold">Olá, {fullName} 👋</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
        </Button>
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
          </>
        )}
      </main>

      <button
        onClick={() => navigate("/chat")}
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Dashboard;
