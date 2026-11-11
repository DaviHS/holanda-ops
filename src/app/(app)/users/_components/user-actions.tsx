'use client';

import { MailCheck, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RouterOutputs } from '@/trpc/react';

type User = RouterOutputs['user']['list'][number];

export interface UserActionHandlers {
  onEdit?: (user: User) => void;
  onSendReset?: (user: User) => void;
  onDelete?: (user: User) => void;
  /** Id do usuário logado: a própria conta não pode ser excluída. */
  currentUserId?: string;
}

export function UserActions({
  user,
  onEdit,
  onSendReset,
  onDelete,
  currentUserId,
}: UserActionHandlers & { user: User }) {
  const canReset = !!onSendReset && user.status === 'active';
  const canDelete = !!onDelete && user.id !== currentUserId;
  if (!onEdit && !canReset && !canDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors"
        aria-label={`Ações de ${user.email}`}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(user)}>
            <Pencil className="mr-2 size-4" /> Editar
          </DropdownMenuItem>
        )}
        {canReset && (
          <DropdownMenuItem onClick={() => onSendReset(user)}>
            <MailCheck className="mr-2 size-4" /> Enviar link de senha
          </DropdownMenuItem>
        )}
        {canDelete && (
          <>
            {(Boolean(onEdit) || canReset) && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={() => onDelete(user)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" /> Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
