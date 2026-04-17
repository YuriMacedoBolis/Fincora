import { useState } from "react";
import { FileText, MessageCircle, User, PlusCircle, BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import MonthlyReport from "@/components/dashboard/MonthlyReport";
import type { Transaction } from "@/pages/Dashboard";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", user?.id, "all"],
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

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden">
        <div className="glass border-t border-border/40 px-4 py-2 flex items-end justify-between">
          {/* Relatório */}
          <button
            id="mobile-tour-report-btn"
            onClick={() => setReportOpen(true)}
            className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium">Relatório</span>
          </button>

          {/* Adicionar */}
          <button
            id="mobile-tour-add-btn"
            data-tour="add-btn"
            onClick={() => setAddOpen(true)}
            className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Adicionar</span>
          </button>

          {/* Chat — elevated center button */}
          <button
            id="mobile-tour-chat-btn"
            data-tour="chat-btn"
            onClick={() => navigate("/chat")}
            className="relative -top-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* Análise */}
          <button
            onClick={() => navigate("/analise")}
            className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${isActive("/analise") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Análise</span>
          </button>

          {/* Perfil */}
          <button
            onClick={() => navigate("/perfil")}
            className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${isActive("/perfil") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Perfil</span>
          </button>
        </div>
      </nav>

      <MonthlyReport transactions={transactions} open={reportOpen} onOpenChange={setReportOpen} />
      <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
};

export default BottomNav;
