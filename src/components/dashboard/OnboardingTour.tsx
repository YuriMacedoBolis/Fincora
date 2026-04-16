import { useState, useEffect } from "react";
import { Joyride, STATUS, Step } from "react-joyride";
import type { EventData } from "react-joyride";

const TOUR_KEY = "fincare_tour_completed";

const steps: Step[] = [
  {
    target: "body",
    placement: "center",
    skipBeacon: true,
    title: "Bem-vindo ao FinCare! 🧡",
    content:
      "Sua nova babá financeira inteligente. Vamos fazer um tour rápido de 1 minuto para você dominar o app.",
  },
  {
    target: '[data-tour="chat-btn"]',
    placement: "top",
    skipBeacon: true,
    title: "A Mágica Acontece Aqui ✨",
    content:
      'Esqueça os formulários chatos! Fale com nossa IA como se fosse um amigo no WhatsApp: "Gastei 50 no ifood" ou "Recebi 2000 de salário" e ela organiza tudo para você.',
  },
  {
    target: '[data-tour="add-btn"]',
    placement: "top",
    skipBeacon: true,
    title: "Adição Manual 📝",
    content:
      "Prefere o método tradicional? Adicione suas receitas e despesas manualmente por aqui.",
  },
  {
    target: '[data-tour="new-goal-btn"]',
    placement: "bottom",
    skipBeacon: true,
    title: "Crie seus Objetivos 🎯",
    content:
      "Quer viajar ou montar sua reserva? Crie uma meta aqui e a categoria será gerada automaticamente no sistema.",
  },
  {
    target: '[data-tour="report-btn"]',
    placement: "bottom",
    skipBeacon: true,
    title: "Seu Mês em PDF 📊",
    content:
      "Com apenas um clique, gere um relatório completo e com visual premium do seu desempenho financeiro. Pronto, você já pode começar!",
  },
];

const sharedStepProps = {
  backgroundColor: "#0A1F17",
  textColor: "#ffffff",
  primaryColor: "#FF6400",
  overlayColor: "rgba(0, 0, 0, 0.75)",
  zIndex: 10000,
  showProgress: true,
};

const OnboardingTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEvent = (data: EventData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(TOUR_KEY, "true");
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      continuous
      showProgress
      onEvent={handleEvent}
      options={tourOptions}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Concluir",
        next: "Próximo",
        skip: "Pular",
      }}
    />
  );
};

export default OnboardingTour;
export { TOUR_KEY };
