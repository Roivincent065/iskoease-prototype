import { useState, type FormEvent } from "react";
import { FieldError } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

const sampleGoogleAccounts = [
  { name: "Maria Clara", email: "maria.clara@nemsu.edu.ph" },
  { name: "Jose Rizal", email: "jose.rizal@nemsu.edu.ph" },
];

export function GoogleAuthDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (name: string, email: string) => void;
}) {
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [error, setError] = useState("");

  const submitCustom = (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!cleanEmail.endsWith("@nemsu.edu.ph")) {
      setError("Only NEMSU Google accounts ending in @nemsu.edu.ph are allowed.");
      return;
    }
    setError("");
    onSelect(customName.trim() || (cleanEmail.split("@")[0] ?? "Student"), cleanEmail);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setError("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GoogleIcon /> Choose a NEMSU Google account
          </DialogTitle>
          <DialogDescription>
            Sign in with an official NEMSU student Google account (<span className="font-medium text-foreground">@nemsu.edu.ph</span>).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {sampleGoogleAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => onSelect(acc.name, acc.email)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-accent"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {acc.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{acc.name}</div>
                <div className="truncate text-xs text-muted-foreground">{acc.email}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="my-1 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or use another Google account
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submitCustom} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="google-name">Full Name</Label>
            <Input
              id="google-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="google-email">NEMSU Google Email</Label>
            <Input
              id="google-email"
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="example@nemsu.edu.ph"
            />
          </div>
          <FieldError msg={error} />
          <Button type="submit" className="w-full">
            Continue with this Google account
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
