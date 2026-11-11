'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/formatters';
import { ACTIONS_CELL_CLASS, editableRowProps } from '@/components/row-actions';
import { userInitials } from '@/lib/user-status';
import { UserAdminBadge, UserStatusBadge } from './user-badges';
import { UserActions, type UserActionHandlers } from './user-actions';

type User = RouterOutputs['user']['list'][number];

interface UserTableProps extends UserActionHandlers {
  users: User[];
}

export function UserTable({ users, onEdit, ...actions }: UserTableProps) {
  return (
    <Card className="overflow-hidden rounded-md">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead className={ACTIONS_CELL_CLASS}>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const displayName =
                user.employee?.name ?? user.email.split('@')[0] ?? 'Usuário';

              return (
                <TableRow
                  key={user.id}
                  {...editableRowProps(onEdit && (() => onEdit(user)))}
                  className="hover:bg-muted/20 cursor-pointer transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
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
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">
                        {user.role?.name ?? 'Sem cargo'}
                      </Badge>
                      <UserAdminBadge
                        isAdmin={user.isAdmin}
                        roleName={user.role?.name}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}
                  </TableCell>
                  <TableCell className={ACTIONS_CELL_CLASS}>
                    <UserActions user={user} onEdit={onEdit} {...actions} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
