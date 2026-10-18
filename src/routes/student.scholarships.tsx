import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Empty, PageHeader, ScholarshipCard, selectClass } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { daysLeft, isOpen, useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/seed";

export const Route = createFileRoute("/student/scholarships")({
  head: () => ({ meta: [{ title: "Find Scholarships - ISKOEASE" }, { name: "description", content: "Search and filter scholarship opportunities." }] }),
  component: FindScholarships,
});

function FindScholarships() {
  const scholarships = useStore((s) => s.scholarships);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [loc, setLoc] = useState("");
  const [deadline, setDeadline] = useState("");

  const open = scholarships.filter(isOpen);
  const locations = Array.from(new Set(open.map((s) => s.location))).sort();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return open
      .filter((s) => !term || s.title.toLowerCase().includes(term) || s.provider.toLowerCase().includes(term))
      .filter((s) => !cat || s.category === cat)
      .filter((s) => !loc || s.location === loc)
      .filter((s) => !deadline || daysLeft(s.deadline) <= Number(deadline))
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [open, q, cat, loc, deadline]);

  const clear = () => {
    setQ("");
    setCat("");
    setLoc("");
    setDeadline("");
  };

  return (
    <>
      <PageHeader title="Find Scholarships" description="All listings are sample demo data and not verified real opportunities." />
      <div className="mb-6 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_auto_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by scholarship or institution" className="pl-9" />
        </div>
        <select className={selectClass} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Type">
          <option value="">All types</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={selectClass} value={loc} onChange={(e) => setLoc(e.target.value)} aria-label="Location">
          <option value="">All locations</option>
          {locations.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select className={selectClass} value={deadline} onChange={(e) => setDeadline(e.target.value)} aria-label="Deadline">
          <option value="">Any deadline</option>
          <option value="14">Within 2 weeks</option>
          <option value="30">Within 30 days</option>
          <option value="90">Within 90 days</option>
        </select>
        <Button variant="ghost" onClick={clear}>Clear</Button>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{results.length} scholarship{results.length === 1 ? "" : "s"} found</p>
      {results.length ? (
        <div className="grid gap-4 md:grid-cols-2">{results.map((s) => <ScholarshipCard key={s.id} s={s} />)}</div>
      ) : (
        <Empty title="No scholarships match your filters" description="Try a different search term or clear the filters." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />
      )}
    </>
  );
}
