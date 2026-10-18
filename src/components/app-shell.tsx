import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import { GraduationCap, LogOut, Menu, X } from "lucide-react";
import { actions, useStore, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
}

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <GraduationCap className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="text-base font-semibold tracking-tight text-foreground">ISKOEASE</div>
        <div className="text-xs text-muted-foreground">Scholarship Portal</div>
      </div>
    </div>
  );
}

export function AppShell({ role, nav, userLabel, userSub }: { role: Exclude<Role, null>; nav: NavItem[]; userLabel: string; userSub: string }) {
  const current = useStore((s) => s.role);
  const loaded = useStore((s) => s.loaded);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loaded && current !== role) navigate({ to: "/", replace: true });
  }, [loaded, current, role, navigate]);

  const logout = () => {
    actions.logout();
    navigate({ to: "/", replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Brand />
        <button className="rounded-md p-1 text-muted-foreground lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            activeOptions={{ exact: !!n.exact }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" }}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </nav>
      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="text-sm font-medium text-foreground">{userLabel}</div>
        <div className="text-xs text-muted-foreground">{userSub}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-sidebar-border bg-sidebar lg:block">{sidebar}</aside>
      {open && <div className="fixed inset-0 z-40 bg-foreground/30 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-foreground" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <Brand />
      </header>
      <main className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {loaded && current === role ? <Outlet /> : <div className="py-20 text-center text-sm text-muted-foreground">Loading...</div>}
        </div>
      </main>
    </div>
  );
}
