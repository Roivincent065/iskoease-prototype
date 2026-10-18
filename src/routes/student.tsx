import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, FileText, LayoutDashboard, Megaphone, Search, User } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

const nav = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/student/scholarships", label: "Find Scholarships", icon: Search },
  { to: "/student/saved", label: "Saved Scholarships", icon: Bookmark },
  { to: "/student/applications", label: "My Applications", icon: FileText },
  { to: "/student/announcements", label: "Announcements", icon: Megaphone },
  { to: "/student/profile", label: "My Profile", icon: User },
];

function StudentLayout() {
  const profile = useStore((s) => s.profile);
  return <AppShell role="student" nav={nav} userLabel={profile.name} userSub="Student (Demo)" />;
}
