import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Lock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

export const SignupModal = ({ open, onOpenChange, onSwitchToLogin }: SignupModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Full name is required."); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email."); return; }
    if (!phone.trim()) { setError("Phone number is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("smartcare_users") || "[]");
      if (users.some((u: any) => u.email === email)) {
        setError("An account with this email already exists.");
        setLoading(false);
        return;
      }

      users.push({ name: name.trim(), email, phone: phone.trim(), password });
      localStorage.setItem("smartcare_users", JSON.stringify(users));

      toast({ title: "Registration successful!", description: "Please login with your credentials." });
      onOpenChange(false);
      resetForm();
      onSwitchToLogin();
      setLoading(false);
    }, 600);
  };

  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setPassword(""); setConfirm(""); setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <UserPlus className="h-6 w-6 text-primary" /> Sign Up
          </DialogTitle>
          <DialogDescription>Create your SmartCare patient account</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSignup} className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="signup-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="signup-name" placeholder="John Doe" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="signup-email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="signup-phone" type="tel" placeholder="+1 234 567 8900" className="pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="signup-password" type="password" placeholder="Min 6 characters" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-confirm">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="signup-confirm" type="password" placeholder="Re-enter password" className="pl-10" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Sign Up"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button type="button" onClick={() => { onOpenChange(false); onSwitchToLogin(); resetForm(); }} className="text-primary hover:underline underline-offset-4">
              Login
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
