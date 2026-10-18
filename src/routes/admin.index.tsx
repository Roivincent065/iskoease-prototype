import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileText, GraduationCap, Megaphone } from "lucide-react";
import { PageHeader, Section, StatCard, StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { formatDate, isOpen, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard - ISKOEASE" }, { name: "description", content: "Overview of listings, applications, and announcements." }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { scholarships, applications, announcements } = useStore((s) => s);
  const recent = [...applications].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 6);
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your scholarship programs."
        action={<Button asChild><Link to="/admin/scholarships">Manage scholarships</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total listings" value={scholarships.length} icon={GraduationCap} />
        <StatCard label="Active scholarships" value={scholarships.filter(isOpen).length} icon={CheckCircle2} />
        <StatCard label="Total applications" value={applications.length} icon={FileText} />
        <StatCard label="Announcements" value={announcements.length} icon={Megaphone} />
      </div>
      <Section
        title="Recently submitted applications"
        className="mt-6"
        action={<Link to="/admin/applications" className="text-xs font-medium text-primary hover:underline">View all</Link>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-5 py-3 font-medium">Student</th><th className="px-5 py-3 font-medium">Scholarship</th><th className="px-5 py-3 font-medium">Submitted</th><th className="px-5 py-3 font-medium">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3 font-medium">{a.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{a.scholarshipTitle}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{formatDate(a.submittedAt)}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">No applications yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
