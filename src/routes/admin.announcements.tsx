import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDelete, Empty, FieldError, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { actions, formatDate, useStore } from "@/lib/store";
import type { Announcement } from "@/lib/seed";

export const Route = createFileRoute("/admin/announcements")({
  head: () => ({ meta: [{ title: "Manage Announcements - ISKOEASE" }, { name: "description", content: "Publish and manage scholarship announcements." }] }),
  component: ManageAnnouncements,
});

type FormState = Omit<Announcement, "id"> & { id?: string };

function ManageAnnouncements() {
  const announcements = useStore((s) => s.announcements);
  const [editing, setEditing] = useState<FormState | null>(null);
  const list = [...announcements].sort((a, b) => b.date.localeCompare(a.date));
  const blank = (): FormState => ({ title: "", institution: "", content: "", date: new Date().toISOString().slice(0, 10) });

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Published announcements are visible to students."
        action={<Button onClick={() => setEditing(blank())}><Plus className="h-4 w-4" /> New announcement</Button>}
      />
      {list.length === 0 ? (
        <Empty title="No announcements yet" action={<Button onClick={() => setEditing(blank())}>Create one</Button>} />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-5">
              <div className="min-w-0">
                <h2 className="font-semibold">{a.title}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.institution} · {formatDate(a.date)}</p>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{a.content}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(a)}><Pencil className="h-4 w-4" /></Button>
                <ConfirmDelete
                  title="Delete this announcement?"
                  description="Students will no longer see it. This cannot be undone."
                  onConfirm={() => { actions.deleteAnnouncement(a.id); toast.success("Announcement deleted"); }}
                  trigger={<Button size="icon" variant="ghost" aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <AnnouncementForm initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function AnnouncementForm({ initial, onClose }: { initial: FormState; onClose: () => void }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    (["title", "institution", "date", "content"] as const).forEach((k) => { if (!f[k].trim()) err[k] = "Required."; });
    setErrors(err);
    if (Object.keys(err).length) return;
    actions.saveAnnouncement(f);
    toast.success(f.id ? "Announcement updated" : "Announcement published");
    onClose();
  };
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{f.id ? "Edit announcement" : "New announcement"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-3">
          <div className="space-y-1.5"><Label>Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /><FieldError msg={errors["title"]} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Institution</Label><Input value={f.institution} onChange={(e) => setF({ ...f, institution: e.target.value })} /><FieldError msg={errors["institution"]} /></div>
            <div className="space-y-1.5"><Label>Publication date</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /><FieldError msg={errors["date"]} /></div>
          </div>
          <div className="space-y-1.5"><Label>Content</Label><Textarea rows={5} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} /><FieldError msg={errors["content"]} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{f.id ? "Save changes" : "Publish"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
