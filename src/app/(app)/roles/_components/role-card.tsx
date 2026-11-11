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
        className="hover:bg-muted/10 group relative mb-3 cursor-pointer transition-colors"
        onClick={() => onEdit?.(role)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                <ShieldCheck className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{role.name}</p>
                {role.description && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                    {role.description}
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
                  onClick={() => onDelete(role)}
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
