import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Empty, PageHeader, StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/student/applications")({
  head: () => ({ meta: [{ title: "My Applications - ISKOEASE" }, { name: "description", content: "Track the status of your scholarship applications." }] }),
  component: MyApplications,
});

function MyApplications() {
  const { applications, profile } = useStore((s) => s);
  const mine = applications.filter((a) => a.email === profile.email);
  return (
    <>
      <PageHeader title="My Applications" description="Track the status of your submitted applications." />
      <div className="mb-4 flex gap-2 rounded-md border border-border bg-info-soft p-3 text-sm text-primary">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Applications are simulated and are not sent to real institutions.
      </div>
      {mine.length ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-5 py-3 font-medium">Scholarship</th><th className="px-5 py-3 font-medium">Submitted</th><th className="px-5 py-3 font-medium">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mine.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3.5">
                    <Link to="/student/scholarship/$id" params={{ id: a.scholarshipId }} className="font-medium text-foreground hover:underline">{a.scholarshipTitle}</Link>
                    <div className="text-xs text-muted-foreground">{a.course}, {a.yearLevel}</div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{formatDate(a.submittedAt)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No applications yet" description="Open a scholarship and select Apply now to submit one." action={<Button asChild><Link to="/student/scholarships">Find scholarships</Link></Button>} />
      )}
    </>
  );
}
