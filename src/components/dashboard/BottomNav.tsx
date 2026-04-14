import { FileText, MessageCircle, User, PlusCircle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  onReportClick: () => void;
  onAddClick: () => void;
}

const BottomNav = ({ onReportClick, onAddClick }: BottomNavProps) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden">
      <div className="glass border-t border-border/40 px-4 py-2 flex items-end justify-between">
        {/* Report */}
        <button
          onClick={onReportClick}
          className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-medium">Relatório</span>
        </button>

        {/* Add */}
        <button
          onClick={onAddClick}
          className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Adicionar</span>
        </button>

        {/* Chat — elevated center button */}
        <button
          onClick={() => navigate("/chat")}
          className="relative -top-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Análise */}
        <button
          onClick={() => navigate("/analise")}
          className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Análise</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate("/perfil")}
          className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
