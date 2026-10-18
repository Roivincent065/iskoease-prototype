import type { ComponentType, ReactNode } from "react";
import { Bookmark, BookmarkCheck, CalendarDays, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { actions, daysLeft, formatDate, useStore } from "@/lib/store";
import type { AppStatus, Scholarship } from "@/lib/seed";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</div>
    </div>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function Empty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const statusStyles: Record<AppStatus, string> = {
  Submitted: "bg-info-soft text-primary",
  "Under Review": "bg-warning-soft text-warning",
  Approved: "bg-success-soft text-success",
  Rejected: "bg-danger-soft text-destructive",
};

export function StatusBadge({ status }: { status: AppStatus }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[status])}>{status}</span>;
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">{children}</span>;
}

export function DeadlineText({ date }: { date: string }) {
  const d = daysLeft(date);
  return (
    <span className="inline-flex items-center gap-1.5">
      <CalendarDays className="h-3.5 w-3.5" />
      {formatDate(date)}
      <span className={cn(d < 0 ? "text-destructive" : d <= 14 ? "text-warning" : "text-muted-foreground")}>
        {d < 0 ? "(closed)" : d === 0 ? "(today)" : `(${d} days left)`}
      </span>
    </span>
  );
}

export function SaveButton({ id, size = "sm" }: { id: string; size?: "sm" | "default" }) {
  const saved = useStore((s) => s.saved.includes(id));
  return (
    <Button variant="outline" size={size} onClick={() => actions.toggleSaved(id)}>
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}

export function ScholarshipCard({ s }: { s: Scholarship }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Tag>{s.category}</Tag>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {s.location}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-foreground">{s.title}</h3>
      <p className="text-sm text-muted-foreground">{s.provider}</p>
      <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{s.description}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Eligibility:</span> {s.eligibility.slice(0, 2).join("; ")}
        {s.eligibility.length > 2 ? "..." : ""}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-xs">
          <DeadlineText date={s.deadline} />
        </span>
        <div className="flex gap-2">
          <SaveButton id={s.id} />
          <Button size="sm" asChild>
            <Link to="/student/scholarship/$id" params={{ id: s.id }}>
              View details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDelete({ title, description, onConfirm, trigger }: { title: string; description: string; onConfirm: () => void; trigger: ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function FieldError({ msg }: { msg?: string | undefined }) {
  return msg ? <p className="mt-1 text-xs text-destructive">{msg}</p> : null;
}

export const selectClass =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
