import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Empty, PageHeader } from "@/components/common";
import { formatDate, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/announcements")({
  head: () => ({ meta: [{ title: "Announcements - ISKOEASE" }, { name: "description", content: "Scholarship openings, deadlines, and requirement updates." }] }),
  component: Announcements,
});

function Announcements() {
  const announcements = useStore((s) => s.announcements);
  const [open, setOpen] = useState<string | null>(null);
  const list = [...announcements].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHeader title="Announcements" description="Updates from scholarship providers." />
      {list.length === 0 ? (
        <Empty title="No announcements yet" />
      ) : (
        <div className="space-y-3">
          {list.map((a) => {
            const expanded = open === a.id;
            return (
              <article key={a.id} className="rounded-lg border border-border bg-card">
                <button onClick={() => setOpen(expanded ? null : a.id)} className="flex w-full items-start justify-between gap-4 p-5 text-left">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{a.title}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.institution} · {formatDate(a.date)}</p>
                    {!expanded && <p className="mt-2 line-clamp-1 text-sm text-foreground/80">{a.content}</p>}
                  </div>
                  <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
                </button>
                {expanded && <p className="whitespace-pre-line border-t border-border px-5 py-4 text-sm leading-relaxed text-foreground/80">{a.content}</p>}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
