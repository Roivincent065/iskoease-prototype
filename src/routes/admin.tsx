import { createFileRoute } from "@tanstack/react-router";
import { FileText, GraduationCap, LayoutDashboard, Megaphone } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AppShell
      role="admin"
      nav={[
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
        { to: "/admin/scholarships", label: "Scholarships", icon: GraduationCap },
        { to: "/admin/applications", label: "Applications", icon: FileText },
        { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
      ]}
      userLabel="Scholarship Office"
      userSub="Institution Administrator (Demo)"
    />
  ),
});
