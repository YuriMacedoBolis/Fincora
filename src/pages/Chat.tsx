import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  isError?: boolean;
}

const WEBHOOK_URL = "https://en8n.mibagencia.com.br/webhook/fincora-chat";
const STORAGE_KEY = "fincora-chat-messages";

const defaultMessage: Message = {
  id: 0,
  text: "Olá! Sou o Assistente Fincora. Como posso ajudar com suas finanças hoje?",
  sender: "bot",
};

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [defaultMessage];
    } catch {
      return [defaultMessage];
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const clearChat = () => {
    setMessages([defaultMessage]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    const messageText = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          user_id: user?.id ?? "",
        }),
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const data = await res.json();
      const botMsg: Message = {
        id: Date.now() + 1,
        text: data.reply ?? "Resposta recebida sem conteúdo.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
          sender: "bot",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="glass px-4 py-3 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <p className="text-sm font-semibold">Assistente Fincora</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
        <Button variant="ghost" size="icon" onClick={clearChat} title="Limpar conversa">
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : msg.isError
                  ? "bg-destructive/20 text-destructive border border-destructive/30 rounded-bl-md"
                  : "glass rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3 text-sm text-muted-foreground flex items-center gap-1">
              <span>Digitando</span>
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="glass px-4 py-3 flex gap-2 shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 rounded-xl bg-secondary border-border"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" className="rounded-xl shrink-0" disabled={isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;
