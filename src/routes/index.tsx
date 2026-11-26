import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Bell, BookmarkCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/common";
import { GoogleIcon } from "@/components/google-auth-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions } from "@/lib/store";
import { ThemeToggle } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in - ISKOEASE" },
      { name: "description", content: "Sign in to ISKOEASE to browse scholarships, apply, and track your applications." },
      { property: "og:title", content: "Sign in - ISKOEASE" },
      { property: "og:description", content: "A scholarship information and management portal for students and institutions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const highlights = [
  {
    icon: Sparkles,
    title: "Personalized Matching",
    desc: "Filter opportunities by your academic profile, GWA, and preferred scholarship categories.",
  },
  {
    icon: BookmarkCheck,
    title: "All-in-One Tracking",
    desc: "Save listings, submit applications, and follow review statuses from one dashboard.",
  },
  {
    icon: Bell,
    title: "Timely Announcements",
    desc: "Stay ahead of opening dates, requirement updates, and upcoming deadlines.",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    const res = await actions.loginWithCredentials(email, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast.success("Signed in successfully");
    navigate({ to: res.role === "student" ? "/student" : "/admin" });
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left Brand Showcase Panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-[oklch(0.46_0.21_288)] p-10 text-primary-foreground lg:flex xl:p-14">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-0.5 shadow-md">
            <img src="/logo.png" alt="IskoEase logo" className="h-full w-full rounded-full object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold tracking-tight">ISKOEASE</div>
            <div className="text-xs text-primary-foreground/80">Scholarship Portal</div>
          </div>
        </div>

        <div className="relative my-auto max-w-md space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-xs">
              Student &amp; Institution Portal
            </span>
            <h1 className="text-3xl font-bold tracking-tight xl:text-4xl">
              Your Path to a Brighter Future
            </h1>
            <p className="text-sm leading-relaxed text-primary-foreground/85">
              Discover verified government, university, and private foundation scholarships in one unified platform.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {highlights.map((item) => (
              <div key={item.title} className="flex items-start gap-3.5 rounded-lg bg-white/10 p-3.5 backdrop-blur-xs">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/15">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-primary-foreground/80">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-primary-foreground/75">
          Prototype only. Accounts and application data are stored locally in your browser.
        </div>
      </div>

      {/* Right Sign-In Panel */}
      <div className="relative flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-14">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <img
              src="/logo.png"
              alt="IskoEase — Your Path to a Brighter Future"
              className="h-24 w-24 rounded-full object-contain shadow-sm"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in to ISKOEASE</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Welcome back! Enter your credentials or continue with your Google account.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-7">
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email address</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@nemsu.edu.ph"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <FieldError msg={error} />
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or continue with
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2.5 py-5 font-medium"
              onClick={() => navigate({ to: "/google-signin", search: { from: "login" } })}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="mt-5 rounded-lg bg-accent/60 px-4 py-3 text-center text-sm">
              <span className="text-muted-foreground">New to ISKOEASE? </span>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline underline-offset-4"
              >
                Create student account <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
