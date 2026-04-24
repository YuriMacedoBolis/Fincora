import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const STORAGE_KEY = "fincare_cookie_consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      // Small delay so it doesn't pop instantly on first paint
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="relative bg-white text-[#003320] rounded-2xl shadow-2xl border border-gray-200 p-5 sm:p-6">
        <button
          onClick={handleAccept}
          aria-label="Fechar"
          className="absolute top-3 right-3 text-[#1a5c3a] hover:text-[#003320] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-sm leading-relaxed pr-6">
          A <span className="font-semibold text-[#FF6400]">FinCare Brasil</span> utiliza armazenamento local para garantir a melhor experiência e segurança na nossa plataforma. Ao continuar, você concorda com a nossa{" "}
          <Link
            to="/privacidade"
            className="text-[#FF6400] font-semibold hover:underline"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAccept}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#FF6400] hover:bg-[#e55a00] transition-colors shadow-md"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
