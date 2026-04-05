import { FileText, MessageCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  onReportClick: () => void;
}

const BottomNav = ({ onReportClick }: BottomNavProps) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden">
      <div className="glass border-t border-border/40 px-6 py-2 flex items-end justify-between">
        {/* Report */}
        <button
          onClick={onReportClick}
          className="flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-medium">Relatório</span>
        </button>

        {/* Chat — elevated center button */}
        <button
          onClick={() => navigate("/chat")}
          className="relative -top-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Profile */}
        <button
          onClick={() => {}}
          className="flex flex-col items-center gap-1 py-2 px-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
