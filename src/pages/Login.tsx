import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

type FormMode = "login" | "signup" | "forgot";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<FormMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [panelSide, setPanelSide] = useState<"left" | "right">("left");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("fincare_remember_email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const switchTo = (target: FormMode) => {
    setMode(target);
    setPanelSide(target === "signup" ? "right" : "left");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) toast.error(error.message);
      else toast.success("Link de recuperação enviado para o seu e-mail!");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      if (!acceptTerms) {
        toast.error("Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        toast.error(error.message);
      } else {
        if (data.user) {
          await supabase.from("profiles").update({ full_name: fullName }).eq("id", data.user.id);
        }
        if (data.user && !data.session) {
          toast.success("Conta criada! 🧡 Verifique sua caixa de entrada para confirmar seu e-mail.", { duration: 8000 });
          setPassword("");
          setFullName("");
          switchTo("login");
        } else if (data.session) {
          toast.success("Conta criada com sucesso!");
          navigate("/dashboard");
        }
      }
    } else {
      if (rememberMe) localStorage.setItem("fincare_remember_email", email);
      else localStorage.removeItem("fincare_remember_email");

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
          toast.error("Você precisa confirmar seu e-mail primeiro.");
        } else if (msg.includes("invalid login credentials")) {
          toast.error("E-mail ou senha incorretos.");
        } else {
          toast.error(error.message);
        }
      } else {
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  // ─── Light-themed input classes ───
  const inputClass = "rounded-xl bg-gray-50 border border-gray-200 text-[#003320] placeholder:text-[#1a5c3a] focus:border-[#FF6400] focus:ring-[#FF6400]";

  const isFlipped = mode === "signup";

  // ─── MOBILE LAYOUT (< md) — 3D Card Flip, forced light theme ───
  const mobileLayout = (
    <div className="flex md:hidden min-h-screen items-center justify-center px-5 py-10 bg-[#F5F5F0]">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#FF6400]">FinCare Brasil</h1>
          <p className="text-sm mt-1 text-[#1a5c3a]">Gerencie suas finanças com inteligência</p>
        </div>

        {/* 3D Flip Container */}
        {mode === "forgot" ? (
          <div className="rounded-2xl p-8 shadow-lg bg-white">
            <form onSubmit={handleSubmit} className="space-y-5 w-full">
              <div className="text-center space-y-1 mb-4">
                <h2 className="text-2xl font-bold text-[#003320]">Recuperar senha</h2>
                <p className="text-sm text-[#1a5c3a]">Enviaremos um link para seu e-mail</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-mf" className="text-[#003320]">E-mail</Label>
                <Input id="email-mf" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
              </div>
              <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold bg-[#FF6400] hover:bg-[#e55a00] text-white" disabled={loading}>
                {loading ? "Carregando..." : "Enviar Link"}
              </Button>
              <p className="text-center text-sm text-[#1a5c3a]">
                <button type="button" onClick={() => switchTo("login")} className="font-medium hover:underline text-[#FF6400]">
                  Voltar para o Login
                </button>
              </p>
            </form>
          </div>
        ) : (
          <div className="relative w-full" style={{ perspective: "1200px" }}>
            <div
              className="relative w-full transition-transform duration-700 ease-in-out"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* ── FRONT: Login ── */}
              <div
                className="w-full rounded-2xl p-8 shadow-lg bg-white"
                style={{ backfaceVisibility: "hidden" }}
              >
                <form onSubmit={handleSubmit} className="space-y-5 w-full">
                  <div className="text-center space-y-1 mb-4">
                    <h2 className="text-2xl font-bold text-[#003320]">Bem-vindo de volta!</h2>
                    <p className="text-sm text-[#1a5c3a]">Entre na sua conta FinCare Brasil</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-ml" className="text-[#003320]">E-mail</Label>
                    <Input id="email-ml" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-ml" className="text-[#003320]">Senha</Label>
                    <div className="relative">
                      <Input id="password-ml" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-10`} required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a5c3a] hover:text-[#003320] transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember-mobile" checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
                      <Label htmlFor="remember-mobile" className="text-sm cursor-pointer text-[#1a5c3a]">Lembre de mim</Label>
                    </div>
                    <button type="button" onClick={() => switchTo("forgot")} className="text-sm hover:underline text-[#FF6400]">
                      Esqueci a senha
                    </button>
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold bg-[#FF6400] hover:bg-[#e55a00] text-white" disabled={loading}>
                    {loading ? "Carregando..." : "Entrar"}
                  </Button>
                  <p className="text-center text-sm text-[#1a5c3a]">
                    Não tem conta?{" "}
                    <button type="button" onClick={() => switchTo("signup")} className="font-medium hover:underline text-[#FF6400]">
                      Criar conta
                    </button>
                  </p>
                </form>
              </div>

              {/* ── BACK: Signup ── */}
              <div
                className="w-full rounded-2xl p-8 shadow-lg bg-white absolute top-0 left-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <form onSubmit={handleSubmit} className="space-y-5 w-full">
                  <div className="text-center space-y-1 mb-4">
                    <h2 className="text-2xl font-bold text-[#003320]">Crie sua conta</h2>
                    <p className="text-sm text-[#1a5c3a]">Comece a controlar suas finanças</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName-mobile" className="text-[#003320]">Nome</Label>
                    <Input id="fullName-mobile" type="text" placeholder="Seu nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-ms" className="text-[#003320]">E-mail</Label>
                    <Input id="email-ms" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-ms" className="text-[#003320]">Senha</Label>
                    <div className="relative">
                      <Input id="password-ms" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-10`} required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a5c3a] hover:text-[#003320] transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms-mobile" checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(v === true)} className="mt-0.5" />
                    <Label htmlFor="terms-mobile" className="text-xs cursor-pointer text-[#1a5c3a] leading-snug">
                      Li e concordo com os{" "}
                      <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-[#FF6400] hover:underline font-medium">Termos de Uso</a>
                      {" "}e{" "}
                      <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-[#FF6400] hover:underline font-medium">Política de Privacidade</a>
                      {" "}da FinCare Brasil
                    </Label>
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold bg-[#FF6400] hover:bg-[#e55a00] text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !acceptTerms}>
                    {loading ? "Carregando..." : "Criar Conta"}
                  </Button>
                  <p className="text-center text-sm text-[#1a5c3a]">
                    Já tem conta?{" "}
                    <button type="button" onClick={() => switchTo("login")} className="font-medium hover:underline text-[#FF6400]">
                      Entrar
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ─── Desktop form helpers (use design system tokens) ───
  const emailField = (idSuffix = "") => (
    <div className="space-y-2">
      <Label htmlFor={`email${idSuffix}`} className="text-[#003320]">E-mail</Label>
      <Input id={`email${idSuffix}`} type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
    </div>
  );

  const passwordField = (idSuffix = "") => (
    <div className="space-y-2">
      <Label htmlFor={`password${idSuffix}`} className="text-[#003320]">Senha</Label>
      <div className="relative">
        <Input id={`password${idSuffix}`} type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-10`} required minLength={6} />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a5c3a] hover:text-[#003320] transition-colors">
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  // ─── Desktop Forms ───
  const loginForm = (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm mx-auto">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-2xl font-bold text-[#003320]">Bem-vindo de volta!</h2>
        <p className="text-[#1a5c3a] text-sm">Entre na sua conta FinCare Brasil</p>
      </div>
      {emailField()}
      {passwordField()}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
          <Label htmlFor="remember" className="text-sm text-[#1a5c3a] cursor-pointer">Lembre de mim</Label>
        </div>
        <button type="button" onClick={() => switchTo("forgot")} className="text-sm text-[#FF6400] hover:underline">
          Esqueci a senha
        </button>
      </div>
      <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold bg-[#FF6400] hover:bg-[#e55a00] text-white" disabled={loading}>
        {loading ? "Carregando..." : "Entrar"}
      </Button>
    </form>
  );

  const signupForm = (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm mx-auto">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-2xl font-bold text-[#003320]">Crie sua conta</h2>
        <p className="text-[#1a5c3a] text-sm">Comece a controlar suas finanças</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-[#003320]">Nome</Label>
        <Input id="fullName" type="text" placeholder="Seu nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} required />
      </div>
      {emailField()}
      {passwordField()}
      <div className="flex items-start space-x-2">
        <Checkbox id="terms-desktop" checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(v === true)} className="mt-0.5" />
        <Label htmlFor="terms-desktop" className="text-xs cursor-pointer text-[#1a5c3a] leading-snug">
          Li e concordo com os{" "}
          <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-[#FF6400] hover:underline font-medium">Termos de Uso</a>
          {" "}e{" "}
          <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-[#FF6400] hover:underline font-medium">Política de Privacidade</a>
          {" "}da FinCare Brasil
        </Label>
      </div>
      <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold bg-[#FF6400] hover:bg-[#e55a00] text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !acceptTerms}>
        {loading ? "Carregando..." : "Criar Conta"}
      </Button>
    </form>
  );

  const forgotForm = (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm mx-auto">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-2xl font-bold text-[#003320]">Recuperar senha</h2>
        <p className="text-[#1a5c3a] text-sm">Enviaremos um link para seu e-mail</p>
      </div>
      {emailField()}
      <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold bg-[#FF6400] hover:bg-[#e55a00] text-white" disabled={loading}>
        {loading ? "Carregando..." : "Enviar Link"}
      </Button>
      <p className="text-center text-sm text-[#1a5c3a]">
        <button type="button" onClick={() => switchTo("login")} className="font-medium hover:underline text-[#FF6400]">Voltar para o Login</button>
      </p>
    </form>
  );

  // ─── DESKTOP LAYOUT (>= md) ───
  const desktopLayout = (
    <div className="hidden md:flex min-h-screen items-center justify-center bg-[#F5F5F0] p-8">
      <div className="relative w-full max-w-4xl h-[560px] rounded-3xl overflow-hidden shadow-2xl flex bg-white">
        
        {/* ── Form containers ── */}
        <div className="relative w-full flex">
          <div
            className={`absolute inset-0 w-1/2 flex items-center justify-center p-10 transition-all duration-700 ease-in-out ${
              panelSide === "left"
                ? "translate-x-0 opacity-100 z-10"
                : "translate-x-full opacity-0 z-0 pointer-events-none"
            }`}
          >
            {mode === "forgot" ? forgotForm : loginForm}
          </div>

          <div
            className={`absolute inset-0 w-1/2 flex items-center justify-center p-10 transition-all duration-700 ease-in-out ${
              panelSide === "right"
                ? "translate-x-full opacity-100 z-10"
                : "translate-x-0 opacity-0 z-0 pointer-events-none"
            }`}
          >
            {signupForm}
          </div>
        </div>

        {/* ── Sliding Orange Overlay Panel ── */}
        <div
          className={`absolute top-0 w-1/2 h-full z-20 transition-transform duration-700 ease-in-out ${
            panelSide === "left" ? "translate-x-full" : "translate-x-0"
          }`}
          style={{ background: "#FF6400" }}
        >
          <div className="flex flex-col items-center justify-center h-full text-white px-12 text-center">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">FinCare Brasil</h1>
            {panelSide === "left" ? (
              <>
                <p className="text-lg mb-2 font-medium">Novo por aqui?</p>
                <p className="text-white/80 text-sm mb-8 max-w-xs">
                  Crie sua conta e comece a organizar suas finanças de forma inteligente.
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#FF6400] font-semibold px-8 h-12"
                  onClick={() => switchTo("signup")}
                >
                  Criar Conta
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg mb-2 font-medium">Já tem uma conta?</p>
                <p className="text-white/80 text-sm mb-8 max-w-xs">
                  Entre com suas credenciais e retome o controle das suas finanças.
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#FF6400] font-semibold px-8 h-12"
                  onClick={() => switchTo("login")}
                >
                  Entrar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  );
};

export default Login;
