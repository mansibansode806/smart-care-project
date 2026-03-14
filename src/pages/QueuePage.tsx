import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft, Users, Clock, Bell, BellRing, Hospital } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { useToast } from "@/hooks/use-toast";

const initialQueues = [
  { hospital: "City Heart Hospital", department: "Cardiology", waiting: 12, avgWait: 25, yourPosition: null as number | null },
  { hospital: "Metro General Hospital", department: "General Medicine", waiting: 28, avgWait: 40, yourPosition: null as number | null },
  { hospital: "National Medical Center", department: "Orthopedics", waiting: 8, avgWait: 15, yourPosition: null as number | null },
  { hospital: "Children's Care Hospital", department: "Pediatrics", waiting: 15, avgWait: 30, yourPosition: null as number | null },
  { hospital: "Apollo Heart Center", department: "Cardiology", waiting: 5, avgWait: 10, yourPosition: null as number | null },
  { hospital: "Sunshine Medical", department: "Dermatology", waiting: 20, avgWait: 35, yourPosition: null as number | null },
];

const QueuePage = () => {
  const [queues, setQueues] = useState(initialQueues);
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const joinQueue = (hospital: string) => {
    setQueues((q) =>
      q.map((item) =>
        item.hospital === hospital
          ? { ...item, waiting: item.waiting + 1, yourPosition: item.waiting + 1 }
          : item
      )
    );
    toast({
      title: "Joined Queue",
      description: `You are now in the queue at ${hospital}.`,
    });
  };

  const toggleReminder = (hospital: string) => {
    const isOn = !reminders[hospital];
    setReminders((r) => ({ ...r, [hospital]: isOn }));
    toast({
      title: isOn ? "Reminder Set ✅" : "Reminder Removed",
      description: isOn
        ? `You'll be notified when your turn is near at ${hospital}.`
        : `Reminder for ${hospital} has been turned off.`,
    });
  };

  // Simulate queue movement – every 8 seconds one patient is served
  useEffect(() => {
    const interval = setInterval(() => {
      setQueues((prev) =>
        prev.map((q) => {
          if (q.waiting <= 0) return q;
          const newWaiting = q.waiting - 1;
          const newPos = q.yourPosition ? q.yourPosition - 1 : null;
          return { ...q, waiting: newWaiting, yourPosition: newPos && newPos > 0 ? newPos : newPos === 0 ? null : newPos };
        })
      );
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Trigger reminder toast when position reaches 2
  useEffect(() => {
    queues.forEach((q) => {
      if (q.yourPosition === 2 && reminders[q.hospital]) {
        toast({
          title: "⏰ Almost Your Turn!",
          description: `Only 1 patient ahead of you at ${q.hospital}. Please get ready!`,
        });
      }
      if (q.yourPosition !== null && q.yourPosition <= 0) {
        toast({
          title: "🎉 It's Your Turn!",
          description: `Please proceed to ${q.hospital} – ${q.department}.`,
        });
        // Auto-remove from queue
        setQueues((prev) =>
          prev.map((item) =>
            item.hospital === q.hospital ? { ...item, yourPosition: null } : item
          )
        );
      }
    });
  }, [queues]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          <span className="font-display text-lg font-bold">Hospital Queue</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Live Patient Queue</h1>
            <p className="text-sm text-muted-foreground">See wait times and join queues — get notified when it's your turn</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {queues.map((q) => {
            const isInQueue = q.yourPosition !== null && q.yourPosition > 0;
            const estimatedMin = isInQueue ? q.yourPosition! * (q.avgWait / Math.max(q.waiting, 1)) : null;

            return (
              <Card key={q.hospital} className="relative overflow-hidden transition-shadow hover:shadow-md">
                {isInQueue && (
                  <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    #{q.yourPosition}
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 font-display text-base">
                    <Hospital className="h-4 w-4 text-primary" />
                    {q.hospital}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{q.department}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-6">
                    <div className="text-center">
                      <Users className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                      <span className="font-display text-2xl font-bold text-foreground">{q.waiting}</span>
                      <p className="text-[10px] text-muted-foreground">In Queue</p>
                    </div>
                    <div className="text-center">
                      <Clock className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                      <span className="font-display text-2xl font-bold text-foreground">~{q.avgWait}</span>
                      <p className="text-[10px] text-muted-foreground">Min Avg Wait</p>
                    </div>
                    {isInQueue && estimatedMin !== null && (
                      <div className="text-center">
                        <BellRing className="mx-auto mb-1 h-5 w-5 text-primary" />
                        <span className="font-display text-2xl font-bold text-primary">~{Math.round(estimatedMin)}</span>
                        <p className="text-[10px] text-muted-foreground">Min Your Wait</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!isInQueue ? (
                      <Button size="sm" className="flex-1" onClick={() => joinQueue(q.hospital)}>
                        <Users className="mr-1.5 h-4 w-4" /> Join Queue
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant={reminders[q.hospital] ? "default" : "outline"}
                        className="flex-1 gap-1.5"
                        onClick={() => toggleReminder(q.hospital)}
                      >
                        {reminders[q.hospital] ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                        {reminders[q.hospital] ? "Reminder On" : "Set Reminder"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <ChatbotWidget />
    </div>
  );
};

export default QueuePage;
