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
  /** Nome do registro, usado no texto lido por leitor de tela. */
  label: string;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Itens extras do menu "⋯", entre o início e o "Excluir". */
  children?: ReactNode;
  /** Botões menores (8), para cards no celular. */
  compact?: boolean;
}

/**
 * Ações padrão das listas (tabela e card): botão "Editar" sempre visível e menu "⋯"
 * com os demais itens. Não aparece se não houver nenhuma ação.
 */
export function RowActions({
  label,
  onEdit,
  onDelete,
  children,
  compact,
}: RowActionsProps) {
  const hasMenu = Boolean(onDelete) || Boolean(children);
  if (!onEdit && !hasMenu) return null;

  return (
    <div
      className="flex items-center justify-end gap-0.5"
      onClick={stopRowEvent}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {onEdit && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(
            'text-muted-foreground hover:text-foreground',
            compact && 'size-8',
          )}
          aria-label={`Editar ${label}`}
          title="Editar"
          onClick={onEdit}
        >
          <Pencil className="size-4" />
        </Button>
      )}

      {hasMenu && (
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
                aria-label={`Mais ações de ${label}`}
                title="Mais ações"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {children}
            {onDelete && (
              <>
                {Boolean(children) && <DropdownMenuSeparator />}
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
      )}
    </div>
  );
}

/** Props para uma linha/card clicável que também abre com Enter pelo teclado. */
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

/** Impede que clique dentro de uma área (ex.: os botões de ação) acione a linha ou o card. */
export const stopRowEvent = (event: MouseEvent) => event.stopPropagation();

/** Classes da célula de ações da tabela: fica fixa na borda direita ao rolar na horizontal. */
export const ACTIONS_CELL_CLASS =
  'bg-card sticky right-0 w-[88px] text-right group-hover/row:bg-muted';
