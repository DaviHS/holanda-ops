'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Badge } from '@/components/ui/badge';
import { EntityCard } from '@/components/entity-card';
import { formatDateTime } from '@/lib/formatters';
import { userInitials } from '@/lib/user-status';
import { UserAdminBadge, UserStatusBadge } from './user-badges';
import { UserActions, type UserActionHandlers } from './user-actions';

type User = RouterOutputs['user']['list'][number];

interface UserCardProps extends UserActionHandlers {
  user: User;
}

export function UserCard({ user, onEdit, ...actions }: UserCardProps) {
  const displayName =
    user.employee?.name?.trim() ?? user.email.split('@')[0] ?? 'Usuário';

  return (
    <EntityCard
      initials={userInitials(displayName)}
      title={displayName}
      subtitle={user.email}
      onOpen={onEdit && (() => onEdit(user))}
      actions={<UserActions user={user} onEdit={onEdit} compact {...actions} />}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <Badge variant="secondary">{user.role?.name ?? 'Sem cargo'}</Badge>
        <UserAdminBadge isAdmin={user.isAdmin} roleName={user.role?.name} />
        <UserStatusBadge status={user.status} />
        {user.lastLoginAt && (
          <span className="text-muted-foreground text-[11px]">
            Acesso: {formatDateTime(user.lastLoginAt)}
          </span>
        )}
      </div>
    </EntityCard>
  );
}
