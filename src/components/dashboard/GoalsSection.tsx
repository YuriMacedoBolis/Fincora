import { useState } from "react";
import { Plus } from "lucide-react";
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
import { toast } from "sonner";
import type { Transaction } from "@/pages/Dashboard";

interface GoalsSectionProps {
  transactions: Transaction[];
}

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const GoalsSection = ({ transactions }: GoalsSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");

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

  // Calculate current month spending per category
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const spentByCategory = transactions
    .filter((t) => t.type === "saida" && t.created_at && t.created_at >= monthStart)
    .reduce<Record<string, number>>((acc, t) => {
      const cat = t.category || "Outros";
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

  return (
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
                <Input
                  placeholder="Ex: Alimentação"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
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
            const spent = spentByCategory[goal.category] || 0;
            const pct = Math.min((spent / goal.monthly_limit) * 100, 100);
            const over = spent > goal.monthly_limit;
            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{goal.category}</span>
                  <span className={over ? "text-orange-500 font-semibold" : "text-muted-foreground"}>
                    {formatBRL(spent)} / {formatBRL(goal.monthly_limit)}
                  </span>
                </div>
                <Progress
                  value={pct}
                  className={`h-2 ${over ? "[&>div]:bg-orange-500" : "[&>div]:bg-emerald-500"}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalsSection;
