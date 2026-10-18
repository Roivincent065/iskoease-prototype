import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDelete, Empty, FieldError, PageHeader, Tag, selectClass } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { actions, formatDate, useStore } from "@/lib/store";
import { CATEGORIES, type Category, type Scholarship } from "@/lib/seed";

export const Route = createFileRoute("/admin/scholarships")({
  head: () => ({ meta: [{ title: "Manage Scholarships - ISKOEASE" }, { name: "description", content: "Create, edit, and remove scholarship listings." }] }),
  component: ManageScholarships,
});

type FormState = {
  id?: string;
  title: string; provider: string; category: Category; location: string; description: string;
  benefits: string; eligibility: string; documents: string; instructions: string; deadline: string; active: boolean;
};

const blank: FormState = {
  title: "", provider: "", category: "Government", location: "", description: "", benefits: "",
  eligibility: "", documents: "", instructions: "", deadline: "", active: true,
};

const toForm = (s: Scholarship): FormState => ({ ...s, eligibility: s.eligibility.join("\n"), documents: s.documents.join("\n") });
const lines = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);

function ManageScholarships() {
  const scholarships = useStore((s) => s.scholarships);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<FormState | null>(null);
  const term = q.toLowerCase();
  const list = scholarships.filter((s) => s.title.toLowerCase().includes(term) || s.provider.toLowerCase().includes(term));

  return (
    <>
      <PageHeader
        title="Scholarships"
        description="Changes appear immediately in the student portal."
        action={<Button onClick={() => setEditing(blank)}><Plus className="h-4 w-4" /> Add scholarship</Button>}
      />
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search listings" className="pl-9" />
      </div>
      {list.length === 0 ? (
        <Empty title="No scholarships found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th><th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Deadline</th><th className="px-5 py-3 font-medium">Active</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3"><div className="font-medium">{s.title}</div><div className="text-xs text-muted-foreground">{s.provider}</div></td>
                  <td className="px-5 py-3"><Tag>{s.category}</Tag></td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{formatDate(s.deadline)}</td>
                  <td className="px-5 py-3">
                    <Switch
                      checked={s.active}
                      aria-label="Toggle active"
                      onCheckedChange={(v) => { const { id: _i, createdAt: _c, ...rest } = s; actions.saveScholarship({ ...rest, id: s.id, active: v }); }}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(toForm(s))}><Pencil className="h-4 w-4" /></Button>
                      <ConfirmDelete
                        title="Delete this scholarship?"
                        description={`"${s.title}" will be removed from the student portal. This cannot be undone.`}
                        onConfirm={() => { actions.deleteScholarship(s.id); toast.success("Scholarship deleted"); }}
                        trigger={<Button size="icon" variant="ghost" aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <ScholarshipForm initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function ScholarshipForm({ initial, onClose }: { initial: FormState; onClose: () => void }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const up = (k: keyof FormState) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    (["title", "provider", "location", "description", "benefits", "instructions", "deadline"] as const).forEach((k) => {
      if (!f[k].trim()) err[k] = "Required.";
    });
    if (!lines(f.eligibility).length) err["eligibility"] = "Add at least one requirement.";
    if (!lines(f.documents).length) err["documents"] = "Add at least one document.";
    setErrors(err);
    if (Object.keys(err).length) return;
    actions.saveScholarship({ ...f, eligibility: lines(f.eligibility), documents: lines(f.documents) });
    toast.success(f.id ? "Scholarship updated" : "Scholarship created");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{f.id ? "Edit scholarship" : "Add scholarship"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-3">
          <F label="Title" err={errors["title"]}><Input value={f.title} onChange={up("title")} /></F>
          <div className="grid gap-3 sm:grid-cols-2">
            <F label="Provider" err={errors["provider"]}><Input value={f.provider} onChange={up("provider")} /></F>
            <F label="Category">
              <select className={selectClass} value={f.category} onChange={up("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            </F>
            <F label="Location" err={errors["location"]}><Input value={f.location} onChange={up("location")} placeholder="e.g. Nationwide" /></F>
            <F label="Deadline" err={errors["deadline"]}><Input type="date" value={f.deadline} onChange={up("deadline")} /></F>
          </div>
          <F label="Description" err={errors["description"]}><Textarea rows={3} value={f.description} onChange={up("description")} /></F>
          <F label="Benefits" err={errors["benefits"]}><Textarea rows={2} value={f.benefits} onChange={up("benefits")} /></F>
          <div className="grid gap-3 sm:grid-cols-2">
            <F label="Eligibility (one per line)" err={errors["eligibility"]}><Textarea rows={4} value={f.eligibility} onChange={up("eligibility")} /></F>
            <F label="Required documents (one per line)" err={errors["documents"]}><Textarea rows={4} value={f.documents} onChange={up("documents")} /></F>
          </div>
          <F label="Application instructions" err={errors["instructions"]}><Textarea rows={2} value={f.instructions} onChange={up("instructions")} /></F>
          <label className="flex items-center gap-3 text-sm">
            <Switch checked={f.active} onCheckedChange={(v) => setF({ ...f, active: v })} /> Active (visible to students)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{f.id ? "Save changes" : "Create scholarship"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, err, children }: { label: string; err?: string | undefined; children: ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}<FieldError msg={err} /></div>;
}
