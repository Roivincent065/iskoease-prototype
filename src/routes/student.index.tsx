import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, FileText, GraduationCap } from "lucide-react";
import { DeadlineText, PageHeader, Section, StatCard, Tag } from "@/components/common";
import { formatDate, isOpen, useStore } from "@/lib/store";

export const Route = createFileRoute("/student/")({
  head: () => ({ meta: [{ title: "Student Dashboard - ISKOEASE" }, { name: "description", content: "Your scholarship overview." }] }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { scholarships, saved, applications, announcements, profile } = useStore((s) => s);
  const open = scholarships.filter(isOpen);
  const mine = applications.filter((a) => a.email === profile.email);
  const upcoming = [...open].sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);
  const recent = [...open].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const linkCls = "text-xs font-medium text-primary hover:underline";

  return (
    <>
      <PageHeader title={`Welcome, ${profile.name.split(" ")[0]}`} description="Here is an overview of your scholarship activity." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available scholarships" value={open.length} icon={GraduationCap} />
        <StatCard label="Saved scholarships" value={saved.length} icon={Bookmark} />
        <StatCard label="Submitted applications" value={mine.length} icon={FileText} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Upcoming deadlines" action={<Link to="/student/scholarships" className={linkCls}>View all</Link>}>
          <ul className="divide-y divide-border">
            {upcoming.map((s) => (
              <li key={s.id}>
                <Link to="/student/scholarship/$id" params={{ id: s.id }} className="block px-5 py-3 hover:bg-muted/60">
                  <div className="text-sm font-medium text-foreground">{s.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground"><DeadlineText date={s.deadline} /></div>
                </Link>
              </li>
            ))}
            {upcoming.length === 0 && <li className="px-5 py-6 text-sm text-muted-foreground">No upcoming deadlines.</li>}
          </ul>
        </Section>
        <Section title="Recently added" action={<Link to="/student/scholarships" className={linkCls}>Browse</Link>}>
          <ul className="divide-y divide-border">
            {recent.map((s) => (
              <li key={s.id}>
                <Link to="/student/scholarship/$id" params={{ id: s.id }} className="flex items-start justify-between gap-3 px-5 py-3 hover:bg-muted/60">
                  <div>
                    <div className="text-sm font-medium text-foreground">{s.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{s.provider}</div>
                  </div>
                  <Tag>{s.category}</Tag>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Recent announcements" className="lg:col-span-2" action={<Link to="/student/announcements" className={linkCls}>View all</Link>}>
          <ul className="divide-y divide-border">
            {announcements.slice(0, 3).map((a) => (
              <li key={a.id} className="px-5 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{a.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(a.date)}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.institution}</p>
              </li>
            ))}
            {announcements.length === 0 && <li className="px-5 py-6 text-sm text-muted-foreground">No announcements yet.</li>}
          </ul>
        </Section>
      </div>
    </>
  );
}
