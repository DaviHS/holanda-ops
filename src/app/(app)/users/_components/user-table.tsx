'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
      <ScrollArea className="w-full">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último acesso</TableHead>
                <TableHead className="w-[50px]">
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
                    onClick={() => onEdit?.(user)}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' &&
                        event.target === event.currentTarget
                      )
                        onEdit?.(user);
                    }}
                    tabIndex={onEdit ? 0 : undefined}
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                          {userInitials(displayName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {displayName}
                          </p>
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
                        <UserAdminBadge isAdmin={user.isAdmin} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <UserStatusBadge status={user.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {user.lastLoginAt
                        ? formatDateTime(user.lastLoginAt)
                        : 'Nunca acessou'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <UserActions user={user} onEdit={onEdit} {...actions} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
