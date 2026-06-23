"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Bot, LayoutDashboard, Play, Settings, TestTube2 } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/evaluation", label: "Evaluation", icon: TestTube2 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/policies", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";

  return (
    <div className="min-h-screen bg-surface text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-secondary-container/15 blur-3xl" />
      </div>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-outline-variant/20 bg-surface-container-low/95 px-3 py-4 shadow-2xl shadow-black/20 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="echo-gradient-button flex h-10 w-10 items-center justify-center rounded-xl">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <span className="sr-only">SupportOps QA</span>
            <div className="text-3xl font-bold leading-none tracking-tight text-primary">Echo</div>
            <div className="echo-label mt-1 text-[10px] text-secondary">Gold Evaluation</div>
          </div>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? currentPath === "/" : currentPath.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "border-l-4 border-secondary bg-secondary-container/30 text-secondary"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-4 border-t border-outline-variant/20 px-1 pt-4">
          <Link
            href="/evaluation"
            className="echo-gradient-button flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
          >
            <Play className="h-4 w-4 fill-current" />
            Run Evaluation
          </Link>
        </div>
      </aside>
      <main className="relative z-10 lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant/20 bg-surface/80 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="echo-gradient-button flex h-9 w-9 items-center justify-center rounded-lg">
              <Bot className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold text-primary">Echo QA</span>
          </div>
          <div className="hidden text-sm font-semibold text-on-surface-variant lg:block">
            Curated gold eval plus one-ticket sample runs
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link
              className="text-on-surface-variant transition-colors hover:text-primary"
              href="/policies"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary-container text-sm font-bold text-white">
              AC
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
