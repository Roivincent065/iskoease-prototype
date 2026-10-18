import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Building2, GraduationCap } from "lucide-react";
import { Brand } from "@/components/app-shell";
import { FieldError } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions } from "@/lib/store";

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
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const enter = (role: "student" | "admin") => {
    actions.login(role);
    navigate({ to: role === "student" ? "/student" : "/admin" });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setError("Enter a valid email and a password of at least 4 characters.");
      return;
    }
    enter(email.toLowerCase().includes("admin") ? "admin" : "student");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ISKOEASE brings scholarship listings, requirements, deadlines, and announcements into one place.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu.ph" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <FieldError msg={error} />
            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or use demo access
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={() => enter("student")}>
              <GraduationCap className="h-4 w-4" /> Student Demo
            </Button>
            <Button variant="outline" onClick={() => enter("admin")}>
              <Building2 className="h-4 w-4" /> Administrator Demo
            </Button>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prototype only. Data is stored in your browser and is for demonstration purposes.
        </p>
      </div>
    </div>
  );
}
