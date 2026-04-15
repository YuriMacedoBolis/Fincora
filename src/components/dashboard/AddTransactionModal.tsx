import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const CATEGORIES_DEFAULT = ["Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Educação", "Compras", "Assinaturas", "Investimentos", "Quitação de Dívidas", "Salário", "Freelance", "Rendimentos", "Outros"];

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddTransactionModal = ({ open, onOpenChange }: AddTransactionModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: customCats = [] } = useQuery({
    queryKey: ["categories", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("name").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((c) => c.name);
    },
    enabled: !!user,
  });
  const allCategories = [...CATEGORIES_DEFAULT, ...customCats];

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"entrada" | "saida">("saida");
  const [date, setDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("");
    setType("saida");
    setDate(new Date());
  };

  const handleSubmit = async () => {
    if (!amount || !description.trim() || !category) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Insira um valor válido.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("transactions").insert({
      amount: parsedAmount,
      description: description.trim(),
      category,
      type,
      user_id: user!.id,
      created_at: date.toISOString(),
    });

    if (error) {
      toast.error("Erro ao registrar transação.");
    } else {
      toast.success("Transação registrada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      resetForm();
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lançamento Manual</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "entrada" ? "default" : "outline"}
                className={cn(
                  "w-full",
                  type === "entrada" && "bg-success text-success-foreground hover:bg-success/90"
                )}
                onClick={() => setType("entrada")}
              >
                Receita
              </Button>
              <Button
                type="button"
                variant={type === "saida" ? "default" : "outline"}
                onClick={() => setType("saida")}
              >
                Despesa
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: Almoço, Salário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full h-12 text-base font-semibold">
            {saving ? "Salvando..." : "Registrar Transação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
