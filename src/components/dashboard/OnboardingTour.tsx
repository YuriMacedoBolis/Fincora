import { useState, useEffect } from "react";
import { Joyride, STATUS } from "react-joyride";
import type { EventData } from "react-joyride";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const HIDE_KEY = "hide_fincare_tutorial";


const steps = [
  {
    target: "#tour-chat-btn",
    placement: "top" as const,
    title: "A Mágica Acontece Aqui ✨",
    content:
      "Fale com nossa IA como no WhatsApp para adicionar gastos e ganhos.",
  },
  {
    target: "#tour-add-btn",
    placement: "top" as const,
    title: "Adição Manual 📝",
    content:
      "Prefere o método tradicional? Adicione transações por aqui.",
  },
  {
    target: "#tour-goal-btn",
    placement: "bottom" as const,
    title: "Crie seus Objetivos 🎯",
    content:
      "Defina metas e o sistema criará a categoria automaticamente.",
  },
  {
    target: "#tour-report-btn",
    placement: "bottom" as const,
    title: "Seu Mês em PDF 📊",
    content:
      "Gere um relatório premium com apenas um clique.",
  },
];

const OnboardingTour = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem(HIDE_KEY);
    if (hidden !== "true") {
      const timer = setTimeout(() => setShowDialog(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(HIDE_KEY, "true");
    }
    setShowDialog(false);
  };

  const handleStartTour = () => {
    if (dontShowAgain) {
      localStorage.setItem(HIDE_KEY, "true");
    }
    setShowDialog(false);
    // Small delay so dialog closes before tour starts
    setTimeout(() => setRunTour(true), 400);
  };

  const handleTourEvent = (data: EventData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
    }
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) handleClose();
      }}>
        <DialogContent className="sm:max-w-md border-border/60" style={{ background: "#0A1F17" }}>
          <DialogHeader>
            <DialogTitle className="text-xl text-center" style={{ color: "#F5EBE1" }}>
              Bem-vindo ao FinCare! 🧡
            </DialogTitle>
            <DialogDescription className="text-center text-sm pt-2" style={{ color: "rgba(245, 235, 225, 0.75)" }}>
              Gostaria de fazer um tour rápido de 1 minuto para conhecer todas as funcionalidades e aprender a usar a IA?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 pt-2 px-1">
            <Checkbox
              id="dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              className="border-white/40 data-[state=checked]:bg-[#FF6400] data-[state=checked]:border-[#FF6400]"
            />
            <Label htmlFor="dont-show" className="text-sm cursor-pointer" style={{ color: "rgba(245, 235, 225, 0.6)" }}>
              Não mostrar novamente
            </Label>
          </div>

          <DialogFooter className="flex-row gap-2 sm:gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-white/20 hover:bg-white/10"
              style={{ color: "#F5EBE1" }}
            >
              Agora não
            </Button>
            <Button
              onClick={handleStartTour}
              className="flex-1 font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: "#FF6400" }}
            >
              Começar Tutorial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {runTour && (
        <Joyride
          steps={steps}
          continuous
          onEvent={handleTourEvent}
          options={{
            skipBeacon: true,
            skipScroll: true,
            backgroundColor: "#0A1F17",
            arrowColor: "#0A1F17",
            textColor: "#ffffff",
            primaryColor: "#FF6400",
            overlayColor: "rgba(0, 0, 0, 0.75)",
            buttons: ["back", "close", "skip", "primary"],
          }}
          locale={{
            back: "Voltar",
            close: "Fechar",
            last: "Concluir",
            next: "Próximo",
            skip: "Pular",
          }}
        />
      )}
    </>
  );
};

export default OnboardingTour;
export { HIDE_KEY };
