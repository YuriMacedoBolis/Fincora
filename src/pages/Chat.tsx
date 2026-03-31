import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const botResponses = [
  "Suas despesas com alimentação estão 12% acima da média este mês. Posso sugerir algumas dicas de economia!",
  "Ótima notícia! Você economizou R$ 320 em transporte comparado ao mês passado.",
  "Lembre-se de revisar suas assinaturas mensais. Encontrei 3 que você não usa há 60 dias.",
  "Seu saldo está positivo! Que tal investir R$ 500 na sua reserva de emergência?",
  "Analisei seus gastos e criei um plano de orçamento personalizado. Deseja ver?",
];

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Olá! Sou o Assistente Fincora. Como posso ajudar com suas finanças hoje?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now() + 1,
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="glass px-4 py-3 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold">Assistente Fincora</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "glass rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="glass px-4 py-3 flex gap-2 shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 rounded-xl bg-secondary border-border"
        />
        <Button type="submit" size="icon" className="rounded-xl shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;
