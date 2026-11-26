import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { FieldError, selectClass } from "@/components/common";
import { GoogleIcon } from "@/components/google-auth-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, COURSES, FINANCIAL_NEED_OPTIONS, PREFERRED_LOCATIONS, YEAR_LEVELS, type Category, type Profile } from "@/lib/seed";
import { actions, isNemsuEmail, isValidStudentId } from "@/lib/store";
import { ThemeToggle } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface RegisterSearch {
  provider?: string | undefined;
  email?: string | undefined;
  name?: string | undefined;
}

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    provider: typeof search["provider"] === "string" ? search["provider"] : undefined,
    email: typeof search["email"] === "string" ? search["email"] : undefined,
    name: typeof search["name"] === "string" ? search["name"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Student Registration - ISKOEASE" },
      { name: "description", content: "Create your ISKOEASE student account with your academic profile and scholarship preferences." },
    ],
  }),
  component: RegisterPage,
});

const emptyProfile: Profile = {
  studentId: "",
  name: "",
  email: "",
  contactNumber: "",
  school: "North Eastern Mindanao State University",
  course: "",
  yearLevel: "1st Year",
  gwa: "",
  preferredCategories: ["Government"],
  preferredLocation: "Nationwide",
  financialNeed: "Full Tuition + Stipend",
};

type RegErrorKey = keyof Profile | "password" | "confirm" | "terms" | "form";

function StepBadge({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {step}
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [profile, setProfile] = useState<Profile>(() => ({
    ...emptyProfile,
    email: search.provider === "google" && search.email ? search.email : "",
    name: search.provider === "google" && search.name ? search.name : "",
  }));
  const [authProvider, setAuthProvider] = useState<"email" | "google">(
    search.provider === "google" && search.email ? "google" : "email",
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<RegErrorKey, string>>>({});
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  useEffect(() => {
    if (search.provider === "google" && search.email) {
      setAuthProvider("google");
      setProfile((prev) => ({
        ...prev,
        email: search.email ?? prev.email,
        name: search.name ?? prev.name,
      }));
    }
  }, [search.provider, search.email, search.name]);

  const toggleCategory = (cat: Category) => {
    const exists = profile.preferredCategories.includes(cat);
    const next = exists
      ? profile.preferredCategories.filter((c) => c !== cat)
      : [...profile.preferredCategories, cat];
    setProfile({ ...profile, preferredCategories: next });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err: Partial<Record<RegErrorKey, string>> = {};

    if (!profile.studentId.trim()) {
      err.studentId = "Student ID number is required.";
    } else if (!isValidStudentId(profile.studentId)) {
      err.studentId = "Enter a valid Student ID number (e.g. 12-34567).";
    }
    if (!profile.name.trim()) err.name = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(profile.email.trim())) {
      err.email = "Enter a valid email address.";
    } else if (!isNemsuEmail(profile.email)) {
      err.email = "Only NEMSU student email addresses ending in @nemsu.edu.ph are allowed.";
    }
    if (!profile.contactNumber.trim()) err.contactNumber = "Contact number is required.";
    if (!profile.school.trim()) err.school = "School or university is required.";
    if (!profile.course.trim()) err.course = "Course / program is required.";
    if (!profile.gwa.trim()) err.gwa = "Current GWA / GPA is required.";
    if (!profile.preferredCategories.length) err.preferredCategories = "Select at least one preferred category.";

    if (authProvider === "email") {
      if (password.length < 6) err.password = "Password must be at least 6 characters.";
      if (password !== confirm) err.confirm = "Passwords do not match.";
    }

    if (!agreedTerms) err.terms = "You must agree to the Terms of Agreement and Privacy Policy.";

    setErrors(err);
    if (Object.keys(err).length) return;

    const res = await actions.registerStudent({
      profile,
      ...(authProvider === "email" ? { password } : {}),
      authProvider,
    });

    if (!res.ok) {
      setErrors({ form: res.error });
      return;
    }

    toast.success("Account created! Welcome to ISKOEASE.");
    navigate({ to: "/student" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="IskoEase logo" className="h-9 w-9 rounded-full object-contain" />
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-foreground">ISKOEASE</div>
              <div className="text-[11px] text-muted-foreground">Student Registration</div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign in
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Create your NEMSU student account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Available exclusively for NEMSU students (<span className="font-medium text-foreground">@nemsu.edu.ph</span>). Fill out your student ID, academic background, and scholarship preferences.
          </p>
        </div>

        {/* Google Sign-Up Banner */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-xs">
          {authProvider === "google" ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-sm text-foreground">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                <span>
                  Connected with Google as <strong>{profile.email}</strong>
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setAuthProvider("email");
                  setProfile({ ...profile, email: "" });
                }}
              >
                Switch to email registration
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Register faster with your NEMSU Google account</div>
                <div className="text-xs text-muted-foreground">Use your official @nemsu.edu.ph Google account to prefill your name and email.</div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2 shrink-0"
                onClick={() => navigate({ to: "/google-signin", search: { from: "register" } })}
              >
                <GoogleIcon />
                Sign up with Google
              </Button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Card 1: Account & Student Identity */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
            <StepBadge
              step={1}
              title="Account & Student Identity"
              subtitle="Your official student identification and login credentials."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="reg-student-id">Student ID Number</Label>
                <Input
                  id="reg-student-id"
                  value={profile.studentId}
                  onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                  placeholder="e.g. 12-34567"
                />
                <FieldError msg={errors.studentId} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                  id="reg-name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Juan Dela Cruz"
                />
                <FieldError msg={errors.name} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">NEMSU Email Address</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={profile.email}
                  disabled={authProvider === "google"}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="example@nemsu.edu.ph"
                />
                <FieldError msg={errors.email} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-contact">Contact Number</Label>
                <Input
                  id="reg-contact"
                  value={profile.contactNumber}
                  onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                  placeholder="0917-555-0142"
                />
                <FieldError msg={errors.contactNumber} />
              </div>
              {authProvider === "email" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                    <FieldError msg={errors.password} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-confirm">Confirm Password</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter password"
                    />
                    <FieldError msg={errors.confirm} />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Card 2: Academic Information */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
            <StepBadge
              step={2}
              title="Academic Information"
              subtitle="Used to match eligibility criteria and prefill scholarship applications."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="reg-school">School / University</Label>
                <Input
                  id="reg-school"
                  value={profile.school}
                  onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                  placeholder="Sample State University"
                />
                <FieldError msg={errors.school} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-course">Course / Degree Program</Label>
                <select
                  id="reg-course"
                  className={selectClass}
                  value={profile.course}
                  onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                >
                  <option value="">Select your course / degree program</option>
                  {COURSES.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.course} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-year">Year Level</Label>
                <select
                  id="reg-year"
                  className={selectClass}
                  value={profile.yearLevel}
                  onChange={(e) => setProfile({ ...profile, yearLevel: e.target.value })}
                >
                  {YEAR_LEVELS.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-gwa">Current GWA / GPA</Label>
                <Input
                  id="reg-gwa"
                  value={profile.gwa}
                  onChange={(e) => setProfile({ ...profile, gwa: e.target.value })}
                  placeholder="e.g. 1.50 or 92%"
                />
                <FieldError msg={errors.gwa} />
              </div>
            </div>
          </section>

          {/* Card 3: Scholarship Preferences */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-5">
            <StepBadge
              step={3}
              title="Scholarship Preferences"
              subtitle="Tell us what kind of financial support and providers you are looking for."
            />
            <div className="space-y-2">
              <Label>Preferred Scholarship Categories</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const active = profile.preferredCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        "rounded-md border px-3.5 py-2 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-foreground hover:bg-accent",
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              <FieldError msg={errors.preferredCategories} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="reg-location">Preferred Location</Label>
                <select
                  id="reg-location"
                  className={selectClass}
                  value={profile.preferredLocation}
                  onChange={(e) => setProfile({ ...profile, preferredLocation: e.target.value })}
                >
                  {PREFERRED_LOCATIONS.map((loc) => (
                    <option key={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-need">Primary Support Preference</Label>
                <select
                  id="reg-need"
                  className={selectClass}
                  value={profile.financialNeed}
                  onChange={(e) => setProfile({ ...profile, financialNeed: e.target.value })}
                >
                  {FINANCIAL_NEED_OPTIONS.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Card 4: Terms of Agreement & Privacy Policy */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
            <StepBadge
              step={4}
              title="Terms of Agreement & Privacy Policy"
              subtitle="Review and accept our terms before creating your account."
            />
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="reg-terms"
                checked={agreedTerms}
                onCheckedChange={(checked) => setAgreedTerms(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="reg-terms" className="text-sm font-normal leading-relaxed text-muted-foreground">
                I have read and agree to the{" "}
                <button
                  type="button"
                  onClick={() => setLegalModal("terms")}
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Terms of Agreement
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => setLegalModal("privacy")}
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Privacy Policy
                </button>
                .
              </Label>
            </div>
            <FieldError msg={errors.terms} />
            <FieldError msg={errors.form} />

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/"
                className="text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
              >
                Already have an account? Sign in
              </Link>
              <Button type="submit" size="lg" className="sm:min-w-52">
                Create Student Account
              </Button>
            </div>
          </section>
        </form>
      </main>

      <Dialog open={legalModal !== null} onOpenChange={(open) => !open && setLegalModal(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {legalModal === "terms" ? "Terms of Agreement" : "Privacy Policy"}
            </DialogTitle>
            <DialogDescription>ISKOEASE Scholarship Portal — Effective October 2026</DialogDescription>
          </DialogHeader>

          {legalModal === "terms" ? (
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                By creating an account on <strong className="text-foreground">ISKOEASE</strong>, you agree to provide accurate and truthful student identification, academic records, and contact information.
              </p>
              <p>
                <strong className="text-foreground">1. Eligibility &amp; Applications:</strong> Submitting a scholarship application through ISKOEASE does not guarantee selection or funding. Final decisions remain with each respective scholarship provider or institution.
              </p>
              <p>
                <strong className="text-foreground">2. Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities performed under your Student ID.
              </p>
              <p>
                <strong className="text-foreground">3. Acceptable Use:</strong> Misrepresentation of academic credentials, GWA, or supporting documents may result in disqualification and account suspension.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">ISKOEASE</strong> respects your privacy and handles personal data in alignment with the Data Privacy Act of 2012 (Republic Act No. 10173).
              </p>
              <p>
                <strong className="text-foreground">1. Information We Collect:</strong> We collect your Student ID number, name, email address (including Google account email when using Google Sign-In), contact number, academic information (school, course, year level, GWA), and scholarship preferences.
              </p>
              <p>
                <strong className="text-foreground">2. How We Use Information:</strong> Your profile data is used to personalize scholarship recommendations, prefill scholarship applications, and allow scholarship administrators to review submitted applications.
              </p>
              <p>
                <strong className="text-foreground">3. Local Prototype Storage:</strong> In this demonstration build, your account, preferences, and application records are stored locally in your browser&apos;s storage and are not transmitted to external third-party servers.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              onClick={() => {
                setAgreedTerms(true);
                setLegalModal(null);
              }}
            >
              Accept &amp; Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
