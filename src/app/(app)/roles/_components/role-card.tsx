'use client';

import { type RouterOutputs } from '@/trpc/react';
import { ShieldCheck, ChevronRight, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Role = RouterOutputs['role']['list'][number];

interface RoleCardProps {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {

  return (
    <>
      <Card 
        className="mb-3 cursor-pointer hover:bg-muted/10 transition-colors relative group"
        onClick={() => onEdit?.(role)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{role.name}</p>
                {role.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {role.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {onDelete && (
                <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(role)}
              >
                <Trash2 className="size-4" />
              </Button>
              )}
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}