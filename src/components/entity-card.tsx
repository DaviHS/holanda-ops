'use client';

import type { ElementType, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { editableRowProps, stopRowEvent } from '@/components/row-actions';
import { cn } from '@/lib/utils';

interface EntityCardProps {
  /** Ícone dentro do círculo (use `initials` para mostrar iniciais no lugar). */
  icon?: ElementType<{ className?: string }>;
  initials?: string;
  title: string;
  subtitle?: ReactNode;
  /** Clique no card (abre a edição). */
  onOpen?: () => void;
  /** Menu de ações (RowActions), opcionalmente com um selo antes. Fica sempre dentro do card. */
  actions?: ReactNode;
  /** Linha extra abaixo (selos, descrição). Só aparece quando houver conteúdo. */
  children?: ReactNode;
  className?: string;
}

/**
 * Card das listas no celular: uma linha compacta (avatar, texto, ações). A grade
 * `minmax(0,1fr) auto` corta o texto longo em vez de empurrar as ações para fora.
 */
export function EntityCard({
  icon: Icon,
  initials,
  title,
  subtitle,
  onOpen,
  actions,
  children,
  className,
}: EntityCardProps) {
  return (
    <Card
      {...editableRowProps(onOpen)}
      className={cn(
        'hover:bg-muted/10 min-w-0 gap-0 py-0 transition-colors',
        onOpen && 'cursor-pointer',
        className,
      )}
    >
      <CardContent className="min-w-0 px-3 py-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {Icon ? <Icon className="size-4" /> : initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{title}</p>
              {subtitle && (
                <div className="text-muted-foreground truncate text-xs">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          {actions && (
            <div
              className="relative z-10 flex shrink-0 items-center gap-1"
              onClick={stopRowEvent}
            >
              {actions}
            </div>
          )}
        </div>
        {children && <div className="mt-1.5 min-w-0">{children}</div>}
      </CardContent>
    </Card>
  );
}
