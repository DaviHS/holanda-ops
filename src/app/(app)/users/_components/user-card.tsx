'use client';

import { useState } from 'react';
import { type RouterOutputs } from '@/trpc/react';
import { ChevronRight, UserCheck, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteUserDialog } from './user-delete-dialog';

type User = RouterOutputs['users']['getAll'][number];

interface UserCardProps {
  user: User;
  onSelectUser?: (user: User) => void;
}

export function UserCard({ user, onSelectUser }: UserCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = user.employee?.name ?? user.email.split('@')[0] ?? 'Usuário';
  const roleName = user.role?.name ?? 'Sem Perfil';

  return (
    <>
      <Card 
        className="mb-3 cursor-pointer hover:bg-muted/10 transition-colors relative group"
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
                    className="text-[10px] px-1.5 py-0 h-4 rounded-md"
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
            
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="size-4" />
              </Button>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteUserDialog
        userId={isDeleting ? user.id : null}
        userName={displayName}
        open={isDeleting}
        onOpenChange={setIsDeleting}
      />
    </>
  );
}