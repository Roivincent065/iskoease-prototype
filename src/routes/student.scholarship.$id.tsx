import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";
import { DeadlineText, Empty, FieldError, SaveButton, Tag, selectClass } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { actions, isOpen, useStore } from "@/lib/store";
import { YEAR_LEVELS, type Scholarship } from "@/lib/seed";

export const Route = createFileRoute("/student/scholarship/$id")({
  head: () => ({ meta: [{ title: "Scholarship Details - ISKOEASE" }, { name: "description", content: "Requirements, benefits, and how to apply." }] }),
  component: Details,
});

function Details() {
  const { id } = Route.useParams();
  const s = useStore((st) => st.scholarships.find((x) => x.id === id));
  const applied = useStore((st) => st.applications.some((a) => a.scholarshipId === id && a.email === st.profile.email));
  const [open, setOpen] = useState(false);

  if (!s) return <Empty title="Scholarship not found" description="It may have been removed by the institution." action={<Button asChild variant="outline"><Link to="/student/scholarships">Back to listings</Link></Button>} />;
  const canApply = isOpen(s) && !applied;

  return (
    <>
      <Link to="/student/scholarships" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-6">
          <div className="flex flex-wrap gap-2"><Tag>{s.category}</Tag><Tag>{s.location}</Tag></div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{s.title}</h1>
          <p className="text-sm text-muted-foreground">{s.provider}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm"><span className="font-medium">Deadline: </span><DeadlineText date={s.deadline} /></span>
            <div className="flex gap-2">
              <SaveButton id={s.id} size="default" />
              <Button onClick={() => setOpen(true)} disabled={!canApply}>{applied ? "Already applied" : isOpen(s) ? "Apply now" : "Closed"}</Button>
            </div>
          </div>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <Block title="Description"><p>{s.description}</p></Block>
          <Block title="Benefits"><p>{s.benefits}</p></Block>
          <Block title="Eligibility requirements"><List items={s.eligibility} /></Block>
          <Block title="Required documents"><List items={s.documents} /></Block>
          <Block title="Application instructions" className="md:col-span-2"><p>{s.instructions}</p></Block>
        </div>
      </div>
      <ApplyDialog s={s} open={open} onOpenChange={setOpen} />
    </>
  );
}

function Block({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="mb-2 text-sm font-semibold text-foreground">{title}</h2>
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-1 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

function ApplyDialog({ s, open, onOpenChange }: { s: Scholarship; open: boolean; onOpenChange: (v: boolean) => void }) {
  const profile = useStore((st) => st.profile);
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...profile, statement: "" });
  const [files, setFiles] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const up = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.name.trim()) err["name"] = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err["email"] = "Enter a valid email address.";
    if (!form.school.trim()) err["school"] = "School is required.";
    if (!form.course.trim()) err["course"] = "Course is required.";
    if (!form.yearLevel) err["yearLevel"] = "Select a year level.";
    if (form.statement.trim().length < 20) err["statement"] = "Write at least 20 characters.";
    s.documents.forEach((d) => { if (!files[d]) err[d] = "Attach this document."; });
    setErrors(err);
    if (Object.keys(err).length) return;
    actions.submitApplication({ scholarshipId: s.id, scholarshipTitle: s.title, ...form, documents: s.documents.map((d) => `${d}: ${files[d]}`) });
    toast.success("Application submitted");
    setDone(true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setDone(false); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {done ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <h2 className="mt-3 text-lg font-semibold">Application submitted</h2>
            <p className="mt-1 text-sm text-muted-foreground">You can follow its status in My Applications. This is a simulated submission.</p>
            <Button className="mt-5" onClick={() => navigate({ to: "/student/applications" })}>Go to My Applications</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Apply: {s.title}</DialogTitle>
              <DialogDescription>{s.provider}</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 rounded-md bg-info-soft p-3 text-xs text-primary">
              <Info className="h-4 w-4 shrink-0" />
              Applications are simulated and are not sent to real institutions.
            </div>
            <form onSubmit={submit} className="space-y-3" noValidate>
              <F label="Student name" err={errors["name"]}><Input value={form.name} onChange={up("name")} /></F>
              <F label="Email address" err={errors["email"]}><Input type="email" value={form.email} onChange={up("email")} /></F>
              <F label="School or university" err={errors["school"]}><Input value={form.school} onChange={up("school")} /></F>
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Course or program" err={errors["course"]}><Input value={form.course} onChange={up("course")} /></F>
                <F label="Year level" err={errors["yearLevel"]}>
                  <select className={selectClass} value={form.yearLevel} onChange={up("yearLevel")}>
                    <option value="">Select</option>
                    {YEAR_LEVELS.map((y) => <option key={y}>{y}</option>)}
                  </select>
                </F>
              </div>
              <F label="Statement of purpose" err={errors["statement"]}><Textarea rows={4} value={form.statement} onChange={up("statement")} /></F>
              <div className="space-y-2">
                <Label>Required documents</Label>
                {s.documents.map((d) => (
                  <div key={d}>
                    <div className="flex flex-col gap-1 rounded-md border border-border p-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm">{d}</span>
                      <input
                        type="file"
                        className="text-xs file:mr-2 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs"
                        onChange={(e) => setFiles({ ...files, [d]: e.target.files?.[0]?.name ?? "" })}
                      />
                    </div>
                    <FieldError msg={errors[d]} />
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full">Submit application</Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function F({ label, err, children }: { label: string; err?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      <FieldError msg={err} />
    </div>
  );
}
