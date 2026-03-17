import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const LoginModal = ({ open, onOpenChange, onSwitchToSignup, onLoginSuccess }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password cannot be empty.");
      return;
    }

    setLoading(true);

    // Simulate auth – check localStorage for registered users
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("smartcare_users") || "[]");
      const found = users.find((u: any) => u.email === email && u.password === password);

      if (found) {
        localStorage.setItem("smartcare_session", JSON.stringify({ name: found.name, email: found.email }));
        toast({ title: "Welcome back!", description: `Logged in as ${found.name}` });
        onLoginSuccess({ name: found.name, email: found.email });
        onOpenChange(false);
        resetForm();
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
    }, 600);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <LogIn className="h-6 w-6 text-primary" /> Login
          </DialogTitle>
          <DialogDescription>Sign in to access your SmartCare dashboard</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="login-email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="login-password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button type="button" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
              Forgot Password?
            </button>
            <button type="button" onClick={() => { onOpenChange(false); onSwitchToSignup(); resetForm(); }} className="text-primary hover:underline underline-offset-4">
              Create an account
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
