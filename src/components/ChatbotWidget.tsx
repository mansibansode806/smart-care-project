import { useState } from "react";
import { MessageCircle, X, Send, Bed, Calendar, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickReplies = [
  { label: "Check Bed Availability", icon: Bed },
  { label: "Book Appointment", icon: Calendar },
  { label: "Find Doctor", icon: Search },
  { label: "Emergency Help", icon: AlertTriangle },
];

const botResponses: Record<string, string> = {
  "check bed availability": "You can check real-time bed availability in the Patient Dashboard. We currently have 8,500+ beds across 120+ partner hospitals. Would you like me to guide you there?",
  "book appointment": "To book an appointment, go to the Patient Dashboard and select 'Book Appointment'. You can choose your preferred doctor, hospital, date and time slot.",
  "find doctor": "You can search for doctors by name or specialization in the Patient Dashboard. We have 2,400+ doctors across various specializations.",
  "emergency help": "🚨 For emergencies, please call 108 immediately or use our Emergency Mode which shows nearest hospitals with ICU availability sorted by proximity.",
  "symptoms of fever": "Common fever symptoms include: elevated body temperature (>98.6°F), chills, sweating, headache, muscle aches, and fatigue. Please consult a doctor if fever persists beyond 3 days.",
  "chest pain": "For chest pain, please seek immediate medical attention. Visit a cardiologist or use our Emergency Mode. Call 108 if the pain is severe.",
};

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(botResponses)) {
    if (lower.includes(key)) return val;
  }
  return "I can help you with booking appointments, checking bed availability, finding doctors, and emergency assistance. How can I help you today?";
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I'm SmartCare Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: getBotReply(userMsg) }]);
    }, 500);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[480px] w-[360px] flex-col rounded-xl border bg-card shadow-2xl">
          <div className="flex items-center justify-between rounded-t-xl bg-primary px-4 py-3">
            <span className="font-display font-semibold text-primary-foreground">SmartCare Assistant</span>
            <button onClick={() => setOpen(false)}>
              <X className="h-5 w-5 text-primary-foreground/80 hover:text-primary-foreground" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {quickReplies.map((q) => (
                <button
                  key={q.label}
                  onClick={() => send(q.label)}
                  className="flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:bg-muted"
                >
                  <q.icon className="h-3 w-3" /> {q.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <Button size="icon" onClick={() => send(input)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
