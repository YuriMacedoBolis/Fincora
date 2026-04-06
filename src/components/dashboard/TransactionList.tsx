import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { Transaction } from "@/pages/Dashboard";

interface TransactionListProps {
  transactions: Transaction[];
  showFilters?: boolean;
}

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type FilterOption = "all" | 5 | 7 | 10;

const TransactionList = ({ transactions, showFilters = true }: TransactionListProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    const now = new Date();
    const cutoff = new Date(now.getTime() - filter * 24 * 60 * 60 * 1000);
    return transactions.filter((t) => {
      if (!t.created_at) return false;
      return new Date(t.created_at) >= cutoff;
    });
  }, [transactions, filter]);

  const openEdit = (t: Transaction) => {
    setEditTx(t);
    setEditDesc(t.description);
    setEditAmount(String(Math.abs(t.amount)));
    setEditCategory(t.category || "");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTx) return;
    const { error } = await supabase
      .from("transactions")
      .update({
        description: editDesc,
        amount: parseFloat(editAmount),
        category: editCategory || null,
      })
      .eq("id", editTx.id);
    if (error) {
      toast.error("Erro ao editar transação.");
    } else {
      toast.success("Transação atualizada!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
    setEditTx(null);
  };

  const handleDelete = async () => {
    if (!deleteTxId) return;
    const { error } = await supabase.from("transactions").delete().eq("id", deleteTxId);
    if (error) {
      toast.error("Erro ao excluir transação.");
    } else {
      toast.success("Transação excluída!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    }
    setDeleteTxId(null);
  };

  return (
    <>
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-base font-semibold">
            {showFilters ? "Últimas Transações" : "Todas as Transações"}
          </h2>
          {showFilters && (
            <div className="flex gap-1">
              {([5, 7, 10] as FilterOption[]).map((opt) => (
                <button
                  key={String(opt)}
                  onClick={() => setFilter(opt)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    filter === opt
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {`${opt} dias`}
                </button>
              ))}
              <button
                onClick={() => navigate("/historico")}
                className="px-2.5 py-1 text-xs rounded-lg transition-colors bg-secondary text-muted-foreground hover:bg-accent"
              >
                Ver Tudo
              </button>
            </div>
          )}
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <span className="text-3xl">📋</span>
            <p className="text-sm text-muted-foreground text-center max-w-[220px]">
              Nenhuma transação por aqui ainda. Mande uma mensagem no chat para começar!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((t) => {
              const isIncome = t.type === "entrada";
              const date = t.created_at
                ? new Date(t.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                : "";
              return (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 ${isIncome ? "bg-emerald-500/10" : "bg-orange-500/10"}`}>
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold whitespace-nowrap ${isIncome ? "text-emerald-500" : "text-orange-500"}`}>
                      {isIncome ? "+" : "-"}{formatBRL(Math.abs(t.amount))}
                    </span>
                    <button onClick={() => openEdit(t)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => setDeleteTxId(t.id)} className="p-1 rounded-lg hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editTx} onOpenChange={(o) => !o && setEditTx(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" min="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTxId} onOpenChange={(o) => !o && setDeleteTxId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
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

export default TransactionList;
