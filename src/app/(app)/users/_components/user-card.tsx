'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    user.employee?.name ?? user.email.split('@')[0] ?? 'Usuário';

  return (
    <Card
      className="hover:bg-muted/10 mb-3 cursor-pointer transition-colors"
      onClick={() => onEdit?.(user)}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {userInitials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{displayName}</p>
              <p className="text-muted-foreground truncate font-mono text-xs">
                {user.email}
              </p>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <UserActions user={user} onEdit={onEdit} {...actions} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{user.role?.name ?? 'Sem cargo'}</Badge>
          <UserAdminBadge isAdmin={user.isAdmin} />
          <UserStatusBadge status={user.status} />
        </div>

        <p className="text-muted-foreground text-[11px]">
          {user.lastLoginAt
            ? `Último acesso: ${formatDateTime(user.lastLoginAt)}`
            : 'Nunca acessou'}
        </p>
      </CardContent>
    </Card>
  );
}
