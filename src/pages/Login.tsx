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
  // Desktop sliding: which panel is active
  const [panelSide, setPanelSide] = useState<"left" | "right">("left");
  const navigate = useNavigate();

  // Load remembered email on mount
  useEffect(() => {
    const saved = localStorage.getItem("fincare_remember_email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const switchTo = (target: FormMode) => {
    setMode(target);
    if (target === "signup") {
      setPanelSide("right");
    } else {
      setPanelSide("left");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Link de recuperação enviado para o seu e-mail!");
      }
      setLoading(false);
      return;
    }

    if (mode === "signup") {
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
          toast.success(
            "Conta criada! 🧡 Verifique sua caixa de entrada para confirmar seu e-mail.",
            { duration: 8000 },
          );
          setPassword("");
          setFullName("");
          switchTo("login");
        } else if (data.session) {
          toast.success("Conta criada com sucesso!");
          navigate("/dashboard");
        }
      }
    } else {
      // Login
      if (rememberMe) {
        localStorage.setItem("fincare_remember_email", email);
      } else {
        localStorage.removeItem("fincare_remember_email");
      }

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

  // ─── Shared form pieces ───

  const emailField = (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-foreground">E-mail</Label>
      <Input
        id="email"
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-xl bg-secondary border-border"
        required
      />
    </div>
  );

  const passwordField = (
    <div className="space-y-2">
      <Label htmlFor="password" className="text-foreground">Senha</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl bg-secondary border-border pr-10"
          required
          minLength={6}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  // ─── Login Form ───

  const loginForm = (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm mx-auto">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta!</h2>
        <p className="text-muted-foreground text-sm">Entre na sua conta FinCare</p>
      </div>
      {emailField}
      {passwordField}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(v) => setRememberMe(v === true)}
          />
          <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
            Lembre de mim
          </Label>
        </div>
        <button
          type="button"
          onClick={() => switchTo("forgot")}
          className="text-sm text-primary hover:underline"
        >
          Esqueci a senha
        </button>
      </div>
      <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold" disabled={loading}>
        {loading ? "Carregando..." : "Entrar"}
      </Button>
      {/* Mobile-only toggle */}
      <p className="text-center text-sm text-muted-foreground md:hidden">
        Não tem conta?{" "}
        <button type="button" onClick={() => switchTo("signup")} className="text-primary font-medium hover:underline">
          Criar conta
        </button>
      </p>
    </form>
  );

  // ─── Signup Form ───

  const signupForm = (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm mx-auto">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-2xl font-bold text-foreground">Crie sua conta</h2>
        <p className="text-muted-foreground text-sm">Comece a controlar suas finanças</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-foreground">Nome</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Seu nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="rounded-xl bg-secondary border-border"
          required
        />
      </div>
      {emailField}
      {passwordField}
      <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold" disabled={loading}>
        {loading ? "Carregando..." : "Criar Conta"}
      </Button>
      {/* Mobile-only toggle */}
      <p className="text-center text-sm text-muted-foreground md:hidden">
        Já tem conta?{" "}
        <button type="button" onClick={() => switchTo("login")} className="text-primary font-medium hover:underline">
          Entrar
        </button>
      </p>
    </form>
  );

  // ─── Forgot Form ───

  const forgotForm = (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm mx-auto">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-2xl font-bold text-foreground">Recuperar senha</h2>
        <p className="text-muted-foreground text-sm">Enviaremos um link para seu e-mail</p>
      </div>
      {emailField}
      <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold" disabled={loading}>
        {loading ? "Carregando..." : "Enviar Link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <button type="button" onClick={() => switchTo("login")} className="text-primary font-medium hover:underline">
          Voltar para o Login
        </button>
      </p>
    </form>
  );

  // Current active form for rendering
  const activeForm = mode === "signup" ? signupForm : mode === "forgot" ? forgotForm : loginForm;

  // ─── MOBILE LAYOUT (< md) ───
  const mobileLayout = (
    <div className="flex md:hidden min-h-screen items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary tracking-tight">FinCare</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie suas finanças com inteligência</p>
        </div>
        {/* Form with fade transition */}
        <div
          key={mode}
          className="animate-fade-in glass rounded-2xl p-6"
        >
          {activeForm}
        </div>
      </div>
    </div>
  );

  // ─── DESKTOP LAYOUT (>= md) ───
  const desktopLayout = (
    <div className="hidden md:flex min-h-screen items-center justify-center bg-background p-8">
      <div className="relative w-full max-w-4xl h-[560px] rounded-3xl overflow-hidden shadow-2xl flex bg-card">
        
        {/* ── Form containers (both always rendered, layered) ── */}
        <div className="relative w-full flex">
          {/* Login form - left half */}
          <div
            className={`absolute inset-0 w-1/2 flex items-center justify-center p-10 transition-all duration-700 ease-in-out ${
              panelSide === "left"
                ? "translate-x-0 opacity-100 z-10"
                : "translate-x-full opacity-0 z-0 pointer-events-none"
            }`}
          >
            {mode === "forgot" ? forgotForm : loginForm}
          </div>

          {/* Signup form - right half */}
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
          style={{ background: "hsl(24, 100%, 50%)" }}
        >
          <div className="flex flex-col items-center justify-center h-full text-white px-12 text-center">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">FinCare</h1>
            {panelSide === "left" ? (
              <>
                <p className="text-lg mb-2 font-medium">Novo por aqui?</p>
                <p className="text-white/80 text-sm mb-8 max-w-xs">
                  Crie sua conta e comece a organizar suas finanças de forma inteligente.
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary font-semibold px-8 h-12"
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
                  className="rounded-xl border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary font-semibold px-8 h-12"
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
