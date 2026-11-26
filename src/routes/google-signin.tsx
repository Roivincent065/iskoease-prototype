import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, ChevronDown, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/google-auth-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, useStore } from "@/lib/store";

interface GoogleSignInSearch {
  from?: string | undefined;
}

export const Route = createFileRoute("/google-signin")({
  validateSearch: (search: Record<string, unknown>): GoogleSignInSearch => ({
    from: typeof search["from"] === "string" ? search["from"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in - Google Accounts" },
      { name: "description", content: "Choose a NEMSU Google account to continue to ISKOEASE." },
    ],
  }),
  component: GoogleChooseAccountPage,
});

function GoogleChooseAccountPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const backTo = search.from === "register" ? "/register" : "/";
  const savedGoogleAccounts = useStore((s) => s.googleAccounts);

  const [useAnother, setUseAnother] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [error, setError] = useState("");

  const handleSelectAccount = async (name: string, email: string) => {
    setError("");
    const res = await actions.loginWithGoogle(email);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (!res.isNew) {
      toast.success(`Signed in with Google as ${email}`);
      navigate({ to: res.role === "student" ? "/student" : "/admin" });
      return;
    }
    toast.info("Complete your student registration form to finish setting up your NEMSU Google account.");
    navigate({
      to: "/register",
      search: { provider: "google", email, name },
    });
  };

  const handleCustomSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    await handleSelectAccount(customName.trim() || (cleanEmail.split("@")[0] ?? "Student"), cleanEmail);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Google-style Top Bar */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <GoogleIcon />
          <span>Sign in with Google</span>
        </div>
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cancel
        </Link>
      </header>

      {/* Centered Google Account Chooser */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-9">
          {/* App Logo */}
          <div className="mb-5">
            <img
              src="/logo.png"
              alt="ISKOEASE"
              className="h-11 w-11 rounded-xl border border-border bg-white object-contain p-0.5 shadow-xs"
            />
          </div>

          <h1 className="text-2xl font-normal tracking-tight text-foreground">
            {useAnother ? "Sign in" : "Choose an account"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            to continue to <span className="font-medium text-primary">ISKOEASE</span>
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-danger-soft px-3.5 py-2.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!useAnother ? (
            <div className="mt-6 divide-y divide-border border-y border-border">
              {savedGoogleAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc.name, acc.email)}
                  className="flex w-full items-center gap-3.5 px-2 py-3.5 text-left transition-colors hover:bg-accent/60"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {(acc.name[0] ?? acc.email[0] ?? "U").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{acc.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{acc.email}</div>
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setUseAnother(true);
                }}
                className="flex w-full items-center gap-3.5 px-2 py-3.5 text-left transition-colors hover:bg-accent/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium text-foreground">Use another account</div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="mt-6 space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="google-custom-name">Full Name</Label>
                <Input
                  id="google-custom-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="google-custom-email">NEMSU Google Email</Label>
                <Input
                  id="google-custom-email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="example@nemsu.edu.ph"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError("");
                    setUseAnother(false);
                  }}
                >
                  Back to accounts
                </Button>
                <Button type="submit">Next</Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Only official NEMSU student accounts (<span className="font-medium text-foreground">@nemsu.edu.ph</span>) are allowed. Before using this app, you can review ISKOEASE&apos;s{" "}
            <Link to="/register" className="text-primary hover:underline underline-offset-2">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/register" className="text-primary hover:underline underline-offset-2">
              Terms of Service
            </Link>
            .
          </p>

          {/* Google-style bottom utility row */}
          <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              English (United States) <ChevronDown className="h-3 w-3" />
            </span>
            <div className="flex items-center gap-4">
              <span>Help</span>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
