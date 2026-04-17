import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const navigate = useNavigate();

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
        // If email confirmation is enabled, no session is returned on signup.
        if (!data.session) {
          toast.success("Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.");
          setMode("login");
        } else {
          toast.success("Conta criada com sucesso!");
          navigate("/dashboard");
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        navigate("/dashboard");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-sm rounded-2xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">FinCare</h1>
          <p className="text-muted-foreground text-sm">
            {mode === "forgot"
              ? "Recupere o acesso à sua conta"
              : "Gerencie suas finanças com inteligência"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome</Label>
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
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
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
          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
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
          )}
          <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold" disabled={loading}>
            {loading
              ? "Carregando..."
              : mode === "forgot"
              ? "Enviar Link de Recuperação"
              : mode === "signup"
              ? "Criar Conta"
              : "Entrar"}
          </Button>
        </form>

        {mode === "login" && (
          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
            >
              Esqueci minha senha
            </button>
            <p className="text-sm text-muted-foreground">
              Não tem conta?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-primary font-medium hover:underline"
              >
                Criar conta
              </button>
            </p>
          </div>
        )}

        {mode === "signup" && (
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-primary font-medium hover:underline"
            >
              Entrar
            </button>
          </p>
        )}

        {mode === "forgot" && (
          <p className="text-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-primary font-medium hover:underline"
            >
              Voltar para o Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
