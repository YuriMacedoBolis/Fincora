import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { usePrivacy } from "@/contexts/PrivacyContext";


const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Compras",
  "Assinaturas",
  "Investimentos",
  "Quitação de Dívidas",
  "Salário",
  "Freelance",
  "Rendimentos",
  "Outros",
];

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const GoalsSection = () => {
  const { user } = useAuth();
  const { maskValue } = usePrivacy();
  const queryClient = useQueryClient();

  // Create state
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  // Edit state
  const [editGoal, setEditGoal] = useState<{ id: string; category: string; monthly_limit: number } | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editLimit, setEditLimit] = useState("");

  // Delete state
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);

  const { data: goals = [] } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("category");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createGoal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("goals").insert({
        category,
        monthly_limit: parseFloat(monthlyLimit),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta criada!");
      setCategory("");
      setMonthlyLimit("");
      setOpen(false);
    },
    onError: () => toast.error("Erro ao criar meta."),
  });

  const openEdit = (goal: { id: string; category: string; monthly_limit: number }) => {
    setEditGoal(goal);
    setEditCategory(goal.category);
    setEditLimit(String(goal.monthly_limit));
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGoal) return;
    const { error } = await supabase
      .from("goals")
      .update({
        category: editCategory,
        monthly_limit: parseFloat(editLimit),
      })
      .eq("id", editGoal.id);
    if (error) {
      toast.error("Erro ao editar meta.");
    } else {
      toast.success("Meta atualizada!");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    }
    setEditGoal(null);
  };

  const handleDelete = async () => {
    if (!deleteGoalId) return;
    const { error } = await supabase.from("goals").delete().eq("id", deleteGoalId);
    if (error) {
      toast.error("Erro ao excluir meta.");
    } else {
      toast.success("Meta excluída!");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    }
    setDeleteGoalId(null);
  };


  return (
    <>
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Minhas Metas</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <Plus className="w-4 h-4" /> Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Nova Meta Mensal</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createGoal.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Limite Mensal (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="500.00"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createGoal.isPending}>
                  {createGoal.isPending ? "Salvando..." : "Criar Meta"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma meta definida.
          </p>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const current = goal.current_amount ?? 0;
              const pct = goal.monthly_limit > 0 ? Math.min((current / goal.monthly_limit) * 100, 100) : 0;
              const reached = current >= goal.monthly_limit;
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{goal.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={reached ? "text-emerald-500 font-semibold" : "text-muted-foreground"}>
                        {maskValue(formatBRL(current))} / {maskValue(formatBRL(goal.monthly_limit))}
                      </span>
                      <button onClick={() => openEdit(goal)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => setDeleteGoalId(goal.id)} className="p-1 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-2 ${reached ? "[&>div]:bg-emerald-500" : "[&>div]:bg-primary"}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Goal Dialog */}
      <Dialog open={!!editGoal} onOpenChange={(o) => !o && setEditGoal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Limite Mensal (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={editLimit}
                onChange={(e) => setEditLimit(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Goal Confirmation */}
      <AlertDialog open={!!deleteGoalId} onOpenChange={(o) => !o && setDeleteGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GoalsSection;
