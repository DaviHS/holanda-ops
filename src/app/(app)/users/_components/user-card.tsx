'use client';

import { type RouterOutputs } from '@/trpc/react';
import { ChevronRight, UserCheck, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type User = RouterOutputs['user']['list'][number];

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const displayName =
    user.employee?.name ?? user.email.split('@')[0] ?? 'Usuário';
  const roleName = user.role?.name ?? 'Sem Perfil';

  return (
    <>
      <Card
        className="hover:bg-muted/10 group relative mb-3 cursor-pointer transition-colors"
        onClick={() => onEdit?.(user)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {displayName.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">{displayName}</p>
                  <Badge
                    variant={
                      roleName.toLowerCase() === 'admin'
                        ? 'default'
                        : 'secondary'
                    }
                    className="h-4 rounded-md px-1.5 py-0 text-[10px]"
                  >
                    {roleName}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-0.5 truncate font-mono text-xs">
                  {user.email}
                </p>
                {user.employee?.name && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <UserCheck className="size-3" /> {user.employee.name}
                  </p>
                )}
              </div>
            </div>

            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive size-8"
                  onClick={() => onDelete(user)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
              <ChevronRight className="text-muted-foreground size-4 shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
