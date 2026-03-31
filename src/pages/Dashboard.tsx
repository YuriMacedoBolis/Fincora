import { useNavigate } from "react-router-dom";
import { LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import TransactionList from "@/components/dashboard/TransactionList";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 glass px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Bem-vindo de volta</p>
          <h1 className="text-lg font-bold">Olá, Usuário 👋</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {/* Content */}
      <main className="px-5 py-6 space-y-6 max-w-lg mx-auto">
        <SummaryCards />
        <ExpenseChart />
        <TransactionList />
      </main>

      {/* FAB to Chat */}
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
