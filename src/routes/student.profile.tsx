import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FieldError, PageHeader, selectClass } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, isValidStudentId, useStore } from "@/lib/store";
import { CATEGORIES, COURSES, FINANCIAL_NEED_OPTIONS, PREFERRED_LOCATIONS, YEAR_LEVELS, type Category, type Profile } from "@/lib/seed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/profile")({
  head: () => ({ meta: [{ title: "My Profile - ISKOEASE" }, { name: "description", content: "Edit your student profile." }] }),
  component: ProfilePage,
});

const textFields: { key: keyof Pick<Profile, "studentId" | "name" | "email" | "contactNumber" | "school" | "gwa">; label: string; placeholder: string }[] = [
  { key: "studentId", label: "Student ID number", placeholder: "e.g. 12-34567" },
  { key: "name", label: "Full name", placeholder: "Juan Dela Cruz" },
  { key: "email", label: "Email address", placeholder: "you@nemsu.edu.ph" },
  { key: "contactNumber", label: "Contact number", placeholder: "09XX-XXX-XXXX" },
  { key: "school", label: "School or university", placeholder: "University name" },
  { key: "gwa", label: "Current GWA / GPA", placeholder: "e.g. 1.50" },
];

function ProfilePage() {
  const profile = useStore((s) => s.profile);
  const [form, setForm] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const toggleCategory = (cat: Category) => {
    const exists = form.preferredCategories.includes(cat);
    const next = exists ? form.preferredCategories.filter((c) => c !== cat) : [...form.preferredCategories, cat];
    setForm({ ...form, preferredCategories: next });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    textFields.forEach((f) => {
      if (!String(form[f.key] ?? "").trim()) err[f.key] = `${f.label} is required.`;
    });
    if (!form.course.trim()) err.course = "Course / Program is required.";
    if (form.studentId.trim() && !isValidStudentId(form.studentId)) {
      err.studentId = "Enter a valid Student ID number (e.g. 12-34567).";
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email address.";
    if (!form.preferredCategories.length) err.preferredCategories = "Select at least one preferred category.";
    setErrors(err);
    if (Object.keys(err).length) return;
    actions.saveProfile(form);
    toast.success("Profile saved");
  };

  return (
    <>
      <PageHeader title="My Profile" description="Your academic details and scholarship preferences. Used to prefill applications." />
      <form onSubmit={submit} noValidate className="max-w-2xl space-y-6 rounded-lg border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {textFields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              <Input
                id={f.key}
                placeholder={f.placeholder}
                value={form[f.key] ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
              <FieldError msg={errors[f.key]} />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="course">Course / Degree Program</Label>
            <select id="course" className={selectClass} value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
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
            <Label htmlFor="year">Year level</Label>
            <select id="year" className={selectClass} value={form.yearLevel} onChange={(e) => setForm({ ...form, yearLevel: e.target.value })}>
              {YEAR_LEVELS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-border pt-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Scholarship Preferences</h2>
          <div className="space-y-2">
            <Label>Preferred scholarship categories</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = form.preferredCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
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
              <Label htmlFor="preferredLocation">Preferred location</Label>
              <select
                id="preferredLocation"
                className={selectClass}
                value={form.preferredLocation}
                onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })}
              >
                {PREFERRED_LOCATIONS.map((loc) => (
                  <option key={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="financialNeed">Support preference</Label>
              <select
                id="financialNeed"
                className={selectClass}
                value={form.financialNeed}
                onChange={(e) => setForm({ ...form, financialNeed: e.target.value })}
              >
                {FINANCIAL_NEED_OPTIONS.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit">Save changes</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setForm(profile);
              setErrors({});
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
