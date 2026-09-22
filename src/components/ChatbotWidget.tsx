import { useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bed,
  Calendar,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const quickReplies = [
  { label: "Check Bed Availability", icon: Bed },
  { label: "Book Appointment", icon: Calendar },
  { label: "Find Doctor", icon: Search },
  { label: "Emergency Help", icon: AlertTriangle },
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([
    {
      sender: "bot",
      text: "Hello! I'm SmartCare's AI Health Assistant. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMessage = text.trim();

    if (!userMessage || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/ai-assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI Assistant unavailable");
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            data.reply ||
            "Sorry, I could not generate a response right now.",
        },
      ]);
    } catch (error) {
      console.error("AI Assistant Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Sorry, the AI Health Assistant is temporarily unavailable. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(message);
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          aria-label="Open AI Health Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h3 className="font-semibold">AI Health Assistant</h3>
              <p className="text-xs text-muted-foreground">
                SmartCare AI Assistant
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex h-[400px] flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-4 py-2 text-sm">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          <div className="flex gap-2 overflow-x-auto border-t p-3">
            {quickReplies.map((item) => {
              const Icon = item.icon;

              return (
                <Button
                  key={item.label}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={isLoading}
                  onClick={() => handleQuickReply(item.label)}
                >
                  <Icon className="mr-1 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t p-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              placeholder="Ask a health question..."
              disabled={isLoading}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />

            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              size="icon"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
