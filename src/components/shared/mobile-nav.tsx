"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarClock,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Settings2,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickActionKind = "employee" | "sector" | "role" | "shift";

interface FlatNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const PRIMARY_BOTTOM_NAV: FlatNavItem[] = [
  { title: "Início", href: "/", icon: LayoutDashboard },
  { title: "Setores", href: "/sectors", icon: Building2 },
  { title: "Funcionários", href: "/employees", icon: Users },
];

const SECONDARY_BOTTOM_NAV: FlatNavItem[] = [
  { title: "Cargos", href: "/roles", icon: UserRound },
  { title: "Turnos", href: "/shifts", icon: CalendarClock },
  { title: "Usuários", href: "/users", icon: Users },
];

interface MobileNavigationProps {
  onTriggerAction?: (action: QuickActionKind) => void;
}

export function MobileNavigation({ onTriggerAction }: MobileNavigationProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const handleActionClick = (action: QuickActionKind) => {
    onTriggerAction?.(action);
    setIsFabOpen(false);
  };

  return (
    <div className="md:hidden">
      {isFabOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      <div className="fixed bottom-22 right-4 z-40 flex flex-col items-end gap-2 pb-[env(safe-area-inset-bottom)]">
        <div
          className={cn(
            "flex flex-col items-end gap-2 transition-all duration-200 ease-out",
            isFabOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-4 scale-95 opacity-0"
          )}
        >
          <button
            onClick={() => handleActionClick("employee")}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold shadow-lg active:scale-95"
          >
            <Users className="size-4 text-primary" />
            + Funcionário
          </button>
          <button
            onClick={() => handleActionClick("sector")}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold shadow-lg active:scale-95"
          >
            <Building2 className="size-4 text-primary" />
            + Setor
          </button>
          <button
            onClick={() => handleActionClick("role")}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold shadow-lg active:scale-95"
          >
            <UserRound className="size-4 text-primary" />
            + Cargo
          </button>
        </div>

        <button
          aria-label="Ações rápidas"
          aria-expanded={isFabOpen}
          onClick={() => setIsFabOpen((prev) => !prev)}
          className={cn(
            "flex size-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform duration-200 active:scale-90",
            isFabOpen && "rotate-45"
          )}
        >
          <Plus className="size-6" />
        </button>
      </div>

      <nav
        aria-label="Navegação móvel"
        className="fixed inset-x-0 bottom-0 z-30 flex h-18 items-center justify-around border-t border-border/80 bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      >
        {PRIMARY_BOTTOM_NAV.map(({ href, title, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span>{title}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setIsMoreOpen(true)}
          className={cn(
            "flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
            SECONDARY_BOTTOM_NAV.some((item) => pathname.startsWith(item.href))
              ? "font-bold text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MoreHorizontal className="size-5" />
          <span>Mais</span>
        </button>
      </nav>

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed inset-0 z-50 flex items-end bg-background/80 backdrop-blur-xs transition-opacity duration-200",
          isMoreOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsMoreOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "w-full rounded-t-3xl border-t border-border bg-card p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300 ease-out",
            isMoreOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/20" />

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">Outras Opções</h2>
            <button
              onClick={() => setIsMoreOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {SECONDARY_BOTTOM_NAV.map(({ href, title, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-left text-xs font-semibold transition-all active:scale-98",
                    isActive && "border-primary/50 bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="size-4 text-primary" />
                  <span>{title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}