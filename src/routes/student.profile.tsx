import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FieldError, PageHeader, selectClass } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actions, useStore } from "@/lib/store";
import { YEAR_LEVELS, type Profile } from "@/lib/seed";

export const Route = createFileRoute("/student/profile")({
  head: () => ({ meta: [{ title: "My Profile - ISKOEASE" }, { name: "description", content: "Edit your student profile." }] }),
  component: ProfilePage,
});

const fields: { key: keyof Profile; label: string }[] = [
  { key: "name", label: "Full name" },
  { key: "email", label: "Email address" },
  { key: "school", label: "School or university" },
  { key: "course", label: "Course" },
];

function ProfilePage() {
  const profile = useStore((s) => s.profile);
  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    fields.forEach((f) => { if (!form[f.key].trim()) err[f.key] = `${f.label} is required.`; });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email address.";
    setErrors(err);
    if (Object.keys(err).length) return;
    actions.saveProfile(form);
    toast.success("Profile saved");
  };

  return (
    <>
      <PageHeader title="My Profile" description="Saved locally in this browser. Used to prefill applications." />
      <form onSubmit={submit} noValidate className="max-w-xl space-y-4 rounded-lg border border-border bg-card p-6">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input id={f.key} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
            <FieldError msg={errors[f.key]} />
          </div>
        ))}
        <div className="space-y-1.5">
          <Label htmlFor="year">Year level</Label>
          <select id="year" className={selectClass} value={form.yearLevel} onChange={(e) => setForm({ ...form, yearLevel: e.target.value })}>
            {YEAR_LEVELS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit">Save changes</Button>
          <Button type="button" variant="ghost" onClick={() => { setForm(profile); setErrors({}); }}>Cancel</Button>
        </div>
      </form>
    </>
  );
}
