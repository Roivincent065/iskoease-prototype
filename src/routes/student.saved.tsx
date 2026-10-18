import { createFileRoute, Link } from "@tanstack/react-router";
import { Empty, PageHeader, ScholarshipCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/student/saved")({
  head: () => ({ meta: [{ title: "Saved Scholarships - ISKOEASE" }, { name: "description", content: "Scholarships you saved for later." }] }),
  component: Saved,
});

function Saved() {
  const { scholarships, saved } = useStore((s) => s);
  const list = scholarships.filter((s) => saved.includes(s.id));
  return (
    <>
      <PageHeader title="Saved Scholarships" description="Scholarships you bookmarked for later." />
      {list.length ? (
        <div className="grid gap-4 md:grid-cols-2">{list.map((s) => <ScholarshipCard key={s.id} s={s} />)}</div>
      ) : (
        <Empty
          title="No saved scholarships yet"
          description="Use the Save button on any scholarship to keep it here."
          action={<Button asChild><Link to="/student/scholarships">Find scholarships</Link></Button>}
        />
      )}
    </>
  );
}
