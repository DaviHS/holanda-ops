'use client';

import { type RouterOutputs } from '@/trpc/react';
import { ChevronRight, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type User = RouterOutputs['users']['getAll'][number];

interface UserCardProps {
  user: User;
  onSelectUser?: (user: User) => void;
}

export function UserCard({ user, onSelectUser }: UserCardProps) {
  // Define o nome de exibição prioritariamente a partir do funcionário ou do e-mail
  const displayName = user.employee?.name ?? user.email.split('@')[0] ?? 'Usuário';
  const roleName = user.role.name;

  return (
    <Card 
      className="mb-3 cursor-pointer hover:bg-muted/10 transition-colors"
      onClick={() => onSelectUser?.(user)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              {displayName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{displayName}</p>
                <Badge 
                  variant={roleName.toLowerCase() === 'admin' ? 'default' : 'secondary'} 
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  {roleName}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                {user.email}
              </p>
              {user.employee?.name && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                  <UserCheck className="size-3" /> {user.employee.name}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}