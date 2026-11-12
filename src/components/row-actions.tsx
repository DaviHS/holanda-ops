'use client';

import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RowActionsProps {
  label: string;
  onEdit?: () => void;
  onDelete?: () => void;

  children?: ReactNode;

  compact?: boolean;
}

export function RowActions({
  label,
  onEdit,
  onDelete,
  children,
  compact,
}: RowActionsProps) {
  if (!onEdit && !onDelete && !children) return null;

  return (
    <div
      className="flex items-center justify-end"
      onClick={stopRowEvent}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                'text-muted-foreground hover:text-foreground',
                compact && 'size-8',
              )}
              aria-label={`Ações de ${label}`}
              title="Ações"
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 size-4" /> Editar
            </DropdownMenuItem>
          )}
          {children}
          {onDelete && (
            <>
              {(Boolean(onEdit) || Boolean(children)) && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" /> Excluir
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function editableRowProps(onEdit?: () => void) {
  return {
    onClick: () => onEdit?.(),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' && event.target === event.currentTarget)
        onEdit?.();
    },
    tabIndex: onEdit ? 0 : undefined,
  };
}

export const stopRowEvent = (event: MouseEvent) => event.stopPropagation();
