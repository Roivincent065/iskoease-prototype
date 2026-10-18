import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Empty, PageHeader, StatusBadge, selectClass } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { actions, formatDate, useStore } from "@/lib/store";
import { STATUSES, type AppStatus } from "@/lib/seed";

export const Route = createFileRoute("/admin/applications")({
  head: () => ({ meta: [{ title: "Applications - ISKOEASE Admin" }, { name: "description", content: "Review applications and update statuses." }] }),
  component: AdminApplications,
});

function AdminApplications() {
  const applications = useStore((s) => s.applications);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const term = q.toLowerCase();
  const list = applications
    .filter((a) => a.name.toLowerCase().includes(term) || a.scholarshipTitle.toLowerCase().includes(term))
    .filter((a) => !status || a.status === status);
  const selected = applications.find((a) => a.id === openId);

  const change = (id: string, s: AppStatus) => { actions.setStatus(id, s); toast.success(`Status set to ${s}`); };

  return (
    <>
      <PageHeader title="Applications" description="Simulated applications submitted by students." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by student or scholarship" className="pl-9" />
        </div>
        <select className={`${selectClass} sm:w-48`} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {list.length === 0 ? (
        <Empty title="No applications found" description="Try a different search or status filter." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th><th className="px-5 py-3 font-medium">Scholarship</th>
                <th className="px-5 py-3 font-medium">Submitted</th><th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3"><div className="font-medium">{a.name}</div><div className="text-xs text-muted-foreground">{a.email}</div></td>
                  <td className="px-5 py-3 text-muted-foreground">{a.scholarshipTitle}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{formatDate(a.submittedAt)}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3 text-right"><Button size="sm" variant="outline" onClick={() => setOpenId(a.id)}>Open</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>{selected.scholarshipTitle}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Email</dt><dd>{selected.email}</dd>
                <dt className="text-muted-foreground">School</dt><dd>{selected.school}</dd>
                <dt className="text-muted-foreground">Course</dt><dd>{selected.course}</dd>
                <dt className="text-muted-foreground">Year level</dt><dd>{selected.yearLevel}</dd>
                <dt className="text-muted-foreground">Submitted</dt><dd>{formatDate(selected.submittedAt)}</dd>
              </dl>
              <div>
                <h3 className="mb-1 text-sm font-semibold">Statement of purpose</h3>
                <p className="text-sm text-foreground/80">{selected.statement}</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold">Documents</h3>
                <ul className="list-disc pl-5 text-sm text-foreground/80">{selected.documents.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <Button key={s} size="sm" variant={selected.status === s ? "default" : "outline"} onClick={() => change(selected.id, s)}>{s}</Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
