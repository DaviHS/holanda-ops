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

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground mb-1 text-[11px] font-medium uppercase">
        {label}
      </dt>
      <dd className="flex min-h-5 flex-wrap items-center gap-1.5 text-sm">
        {children}
      </dd>
    </div>
  );
}

export function UserCard({ user, onEdit, ...actions }: UserCardProps) {
  const displayName =
    user.employee?.name?.trim() ?? user.email.split('@')[0] ?? 'Usuário';

  return (
    <Card
      className="hover:bg-muted/10 mb-2 cursor-pointer transition-colors"
      onClick={() => onEdit?.(user)}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {userInitials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{displayName}</p>
              <p className="text-muted-foreground truncate text-xs">
                {user.email}
              </p>
            </div>
          </div>
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <UserActions user={user} onEdit={onEdit} compact {...actions} />
          </div>
        </div>

        <dl className="bg-muted/20 grid grid-cols-2 gap-x-4 gap-y-2 border-t px-3 py-2">
          <Field label="Cargo">
            <Badge variant="secondary">{user.role?.name ?? 'Sem cargo'}</Badge>
            <UserAdminBadge isAdmin={user.isAdmin} roleName={user.role?.name} />
          </Field>
          <Field label="Status">
            <UserStatusBadge status={user.status} />
          </Field>
          {user.lastLoginAt && (
            <Field label="Último acesso" className="col-span-2">
              {formatDateTime(user.lastLoginAt)}
            </Field>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
