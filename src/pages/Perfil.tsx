import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, LogOut, Trash2, AlertTriangle, ChevronRight, Moon, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CATEGORIES_DEFAULT = ["Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Educação", "Compras", "Assinaturas", "Investimentos", "Quitação de Dívidas", "Salário", "Freelance", "Rendimentos", "Outros"];

/** Aplica máscara (XX) XXXXX-XXXX a uma string de dígitos */
const formatPhone = (digits: string): string => {
  const d = digits.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

/** Remove tudo que não é dígito */
const sanitizePhone = (value: string): string => value.replace(/\D/g, "");

const Perfil = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [customCategories, setCustomCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  // Change password state
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  // Change email state
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, currency, theme")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch custom categories from Supabase
  const { data: customCatsData } = useQuery({
    queryKey: ["categories", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (customCatsData) setCustomCategories(customCatsData);
  }, [customCatsData]);

  const allCategoryNames = [...CATEGORIES_DEFAULT, ...customCategories.map(c => c.name)];
  const fullName = profile?.full_name || "Usuário";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentCurrency = profile?.currency || "BRL";
  const darkMode = theme === "dark";

  // Initialize editPhone from profile data
  useEffect(() => {
    if (profile?.phone) {
      setEditPhone(formatPhone(profile.phone));
    }
  }, [profile?.phone]);

  const handleSavePhone = async () => {
    setSavingPhone(true);
    const { error } = await supabase
      .from("profiles")
      .update({ phone: sanitizePhone(editPhone) || null })
      .eq("id", user!.id);
    if (error) {
      toast.error("Erro ao salvar telefone");
    } else {
      toast.success("Telefone atualizado!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
    setSavingPhone(false);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editName.trim() })
      .eq("id", user!.id);
    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditProfileOpen(false);
    }
    setSavingProfile(false);
  };

  const handleCurrencyChange = async (value: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ currency: value })
      .eq("id", user!.id);
    if (error) {
      toast.error("Erro ao salvar moeda");
    } else {
      toast.success("Moeda atualizada!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Informe sua senha atual");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setSavingPass(true);
    // Re-authenticate with current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: currentPassword,
    });
    if (signInError) {
      toast.error("Senha atual incorreta");
      setSavingPass(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangePassOpen(false);
    }
    setSavingPass(false);
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("E-mail de confirmação enviado!");
      setNewEmail("");
      setChangeEmailOpen(false);
    }
    setSavingEmail(false);
  };

  const handleAddCategory = async () => {
    const cat = newCategory.trim();
    if (!cat) {
      toast.error("Digite o nome da categoria.");
      return;
    }
    if (allCategoryNames.some((c) => c.toLowerCase() === cat.toLowerCase())) {
      toast.error("Essa categoria já existe.");
      return;
    }
    setSavingCategory(true);
    const { error } = await supabase.from("categories").insert({
      user_id: user!.id,
      name: cat,
    });
    if (error) {
      toast.error("Erro ao adicionar categoria.");
    } else {
      setCustomCategories((prev) => [...prev, { id: crypto.randomUUID(), name: cat }]);
      setNewCategory("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria adicionada!");
    }
    setSavingCategory(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAllRecords = async () => {
    const { error } = await supabase.from("transactions").delete().eq("user_id", user!.id);
    if (error) {
      toast.error("Erro ao apagar registros");
    } else {
      await supabase.from("goals").delete().eq("user_id", user!.id);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Todos os registros foram apagados");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Sua conta foi excluída com sucesso.");
      navigate("/login");
    } catch (err: any) {
      toast.error("Erro ao excluir conta: " + (err.message || "Tente novamente."));
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 glass px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Configurações</h1>
      </header>

      <main className="px-5 py-6 space-y-5 max-w-lg mx-auto">
        {/* Profile Card */}
        <Card className="border-border/40">
          <CardContent className="py-6 space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 text-lg">
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg truncate">{fullName}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Dialog open={editProfileOpen} onOpenChange={(o) => {
                setEditProfileOpen(o);
                if (o) {
                  setEditName(fullName);
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Nome completo</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Seu nome" />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full">
                      {savingProfile ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="h-px bg-border/50" />

            {/* Phone field — always visible */}
            <div className="space-y-2">
              <Label className="text-sm">Telefone</Label>
              <div className="flex gap-2">
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={16}
                  inputMode="tel"
                  className="h-9 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 h-9"
                  disabled={savingPhone}
                  onClick={handleSavePhone}
                >
                  {savingPhone ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Segurança e Acesso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog open={changeEmailOpen} onOpenChange={setChangeEmailOpen}>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between py-3 px-1 text-sm hover:bg-accent/50 rounded-lg transition-colors">
                  <span>Alterar E-mail</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Alterar E-mail</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Novo e-mail</Label>
                    <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="novo@email.com" />
                  </div>
                  <p className="text-xs text-muted-foreground">Um e-mail de confirmação será enviado para o novo endereço.</p>
                  <Button onClick={handleChangeEmail} disabled={savingEmail} className="w-full">
                    {savingEmail ? "Enviando..." : "Confirmar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="h-px bg-border/50" />

            <Dialog open={changePassOpen} onOpenChange={setChangePassOpen}>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between py-3 px-1 text-sm hover:bg-accent/50 rounded-lg transition-colors">
                  <span>Alterar Senha</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Alterar Senha</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Senha atual</Label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova senha</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar nova senha</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <Button onClick={handleChangePassword} disabled={savingPass} className="w-full">
                    {savingPass ? "Salvando..." : "Alterar Senha"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Preferências e Finanças</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Dark mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Modo Escuro</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={handleThemeToggle} />
            </div>

            <div className="h-px bg-border/50" />

            {/* Currency */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm">Moeda Principal</span>
              <Select value={currentCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">R$ BRL</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-px bg-border/50" />

            {/* Categories */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Categorias de Transação</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_DEFAULT.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
                {customCategories.map((cat) => (
                  <Badge key={cat.id} variant="secondary" className="text-xs flex items-center gap-1 pr-1">
                    {cat.name}
                    <button
                      onClick={async () => {
                        const { error } = await supabase.from("categories").delete().eq("id", cat.id);
                        if (error) {
                          toast.error("Erro ao remover categoria.");
                        } else {
                          setCustomCategories((prev) => prev.filter((c) => c.id !== cat.id));
                          queryClient.invalidateQueries({ queryKey: ["categories"] });
                          toast.success("Categoria removida com sucesso!");
                        }
                      }}
                      className="rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nova categoria"
                  className="h-9 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <Button size="sm" variant="outline" onClick={handleAddCategory} className="shrink-0 h-9">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 text-base font-semibold border-border/40"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da conta
        </Button>

        {/* Danger Zone */}
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Zerar todos os meus registros
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todas as suas transações e metas serão permanentemente apagadas. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllRecords} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir minha conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é permanente. Todos os seus dados serão removidos e não poderão ser recuperados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir Conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50 pt-4">FinCare v1.0.0</p>
      </main>
    </div>
  );
};

export default Perfil;
