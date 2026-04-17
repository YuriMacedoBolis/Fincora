import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import TransactionList from "@/components/dashboard/TransactionList";
import type { Transaction } from "@/types";

const Historico = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.id, "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 glass px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-xl hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Histórico de Transações</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 max-w-lg mx-auto w-full">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <TransactionList transactions={transactions} showFilters={false} />
        )}
      </main>
    </div>
  );
};

export default Historico;
