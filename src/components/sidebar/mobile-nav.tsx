'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import {
  MOBILE_PRIMARY_LINKS,
  MOBILE_SECONDARY_LINKS,
  isLinkActive,
  isLinkAllowed,
} from '@/config/navigation';

export type QuickActionKind = 'employee' | 'sector' | 'role' | 'shift';

interface MobileNavigationProps {
  onTriggerAction?: (action: QuickActionKind) => void;
}

export function MobileNavigation({ onTriggerAction }: MobileNavigationProps) {
  const pathname = usePathname();
  const { can } = usePermissions();
  const PRIMARY_BOTTOM_NAV = MOBILE_PRIMARY_LINKS.filter((link) =>
    isLinkAllowed(link, can),
  );
  const SECONDARY_BOTTOM_NAV = MOBILE_SECONDARY_LINKS.filter((link) =>
    isLinkAllowed(link, can),
  );
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
          className="bg-background/60 fixed inset-0 z-30 backdrop-blur-xs transition-opacity"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      <div className="fixed right-4 bottom-22 z-40 flex flex-col items-end gap-2 pb-[env(safe-area-inset-bottom)]">
        <div
          className={cn(
            'flex flex-col items-end gap-2 transition-all duration-200 ease-out',
            isFabOpen
              ? 'translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none translate-y-4 scale-95 opacity-0',
          )}
        >
          {can('employees.manage') && (
            <button
              onClick={() => handleActionClick('employee')}
              className="border-border bg-card flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold shadow-lg active:scale-95"
            >
              <Users className="text-primary size-4" />+ Funcionário
            </button>
          )}
          {can('sectors.manage') && (
            <button
              onClick={() => handleActionClick('sector')}
              className="border-border bg-card flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold shadow-lg active:scale-95"
            >
              <Building2 className="text-primary size-4" />+ Setor
            </button>
          )}
          {can('roles.manage') && (
            <button
              onClick={() => handleActionClick('role')}
              className="border-border bg-card flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold shadow-lg active:scale-95"
            >
              <ShieldCheck className="text-primary size-4" />+ Cargo
            </button>
          )}
        </div>

        <button
          aria-label="Ações rápidas"
          aria-expanded={isFabOpen}
          onClick={() => setIsFabOpen((prev) => !prev)}
          className={cn(
            'bg-primary text-primary-foreground flex size-13 items-center justify-center rounded-full shadow-xl transition-transform duration-200 active:scale-90',
            isFabOpen && 'rotate-45',
          )}
        >
          <Plus className="size-6" />
        </button>
      </div>

      <nav
        aria-label="Navegação móvel"
        className="border-border/80 bg-card/95 fixed inset-x-0 bottom-0 z-30 flex h-18 items-center justify-around border-t px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      >
        {PRIMARY_BOTTOM_NAV.map(({ href, title, icon: Icon }) => {
          const isActive = isLinkActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-14 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground',
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
            'flex min-w-14 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors',
            SECONDARY_BOTTOM_NAV.some((item) =>
              isLinkActive(pathname, item.href),
            )
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground',
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
          'bg-background/80 fixed inset-0 z-50 flex items-end backdrop-blur-xs transition-opacity duration-200',
          isMoreOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setIsMoreOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'border-border bg-card w-full rounded-t-3xl border-t p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300 ease-out',
            isMoreOpen ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="bg-muted-foreground/20 mx-auto mb-4 h-1.5 w-12 rounded-full" />

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">
              Outras Opções
            </h2>
            <button
              onClick={() => setIsMoreOpen(false)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full p-1.5 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {SECONDARY_BOTTOM_NAV.map(({ href, title, icon: Icon }) => {
              const isActive = isLinkActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMoreOpen(false)}
                  className={cn(
                    'border-border/60 bg-muted/30 flex items-center gap-3 rounded-md border p-3.5 text-left text-xs font-semibold transition-all active:scale-98',
                    isActive && 'border-primary/50 bg-primary/10 text-primary',
                  )}
                >
                  <Icon className="text-primary size-4" />
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
