'use client';

import { MailCheck } from 'lucide-react';
import { RowActions } from '@/components/row-actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { RouterOutputs } from '@/trpc/react';

type User = RouterOutputs['user']['list'][number];

export interface UserActionHandlers {
  onEdit?: (user: User) => void;
  onSendReset?: (user: User) => void;
  onDelete?: (user: User) => void;
  /** Id do usuário logado: a própria conta não pode ser excluída. */
  currentUserId?: string;
  compact?: boolean;
}

export function UserActions({
  user,
  onEdit,
  onSendReset,
  onDelete,
  currentUserId,
  compact,
}: UserActionHandlers & { user: User }) {
  const canReset = !!onSendReset && user.status === 'active';
  const canDelete = !!onDelete && user.id !== currentUserId;

  return (
    <RowActions
      compact={compact}
      label={user.email}
      onEdit={onEdit && (() => onEdit(user))}
      onDelete={canDelete ? () => onDelete(user) : undefined}
    >
      {canReset && (
        <DropdownMenuItem onClick={() => onSendReset(user)}>
          <MailCheck className="mr-2 size-4" /> Enviar link de senha
        </DropdownMenuItem>
      )}
    </RowActions>
  );
}
