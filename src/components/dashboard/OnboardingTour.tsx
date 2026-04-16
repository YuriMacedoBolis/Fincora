import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

const TOUR_KEY = "fincare_tour_completed";

const steps: Step[] = [
  {
    target: "body",
    placement: "center",
    disableBeacon: true,
    title: "Bem-vindo ao FinCare! 🧡",
    content:
      "Sua nova babá financeira inteligente. Vamos fazer um tour rápido de 1 minuto para você dominar o app.",
  },
  {
    target: '[data-tour="chat-btn"]',
    placement: "top",
    disableBeacon: true,
    title: "A Mágica Acontece Aqui ✨",
    content:
      'Esqueça os formulários chatos! Fale com nossa IA como se fosse um amigo no WhatsApp: "Gastei 50 no ifood" ou "Recebi 2000 de salário" e ela organiza tudo para você.',
  },
  {
    target: '[data-tour="add-btn"]',
    placement: "top",
    disableBeacon: true,
    title: "Adição Manual 📝",
    content:
      "Prefere o método tradicional? Adicione suas receitas e despesas manualmente por aqui.",
  },
  {
    target: '[data-tour="new-goal-btn"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Crie seus Objetivos 🎯",
    content:
      "Quer viajar ou montar sua reserva? Crie uma meta aqui e a categoria será gerada automaticamente no sistema.",
  },
  {
    target: '[data-tour="report-btn"]',
    placement: "bottom",
    disableBeacon: true,
    title: "Seu Mês em PDF 📊",
    content:
      "Com apenas um clique, gere um relatório completo e com visual premium do seu desempenho financeiro. Pronto, você já pode começar!",
  },
];

const OnboardingTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      // Small delay so DOM targets are mounted
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCallback = (data: CallBackProps) => {
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
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Concluir",
        next: "Próximo",
        skip: "Pular",
      }}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: "#0A1F17",
          backgroundColor: "#0A1F17",
          textColor: "#ffffff",
          primaryColor: "#FF6400",
          overlayColor: "rgba(0, 0, 0, 0.75)",
        },
        tooltipTitle: {
          fontSize: 17,
          fontWeight: 700,
        },
        tooltipContent: {
          fontSize: 14,
          lineHeight: 1.6,
        },
        buttonNext: {
          backgroundColor: "#FF6400",
          color: "#ffffff",
          borderRadius: 8,
          fontWeight: 600,
        },
        buttonBack: {
          color: "#ffffff",
          marginRight: 8,
        },
        buttonSkip: {
          color: "rgba(255,255,255,0.5)",
          fontSize: 13,
        },
        tooltip: {
          borderRadius: 16,
          padding: "20px 24px",
        },
      }}
    />
  );
};

export default OnboardingTour;
export { TOUR_KEY };
