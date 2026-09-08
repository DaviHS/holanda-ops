'use client';

import { type RouterOutputs } from '@/trpc/react';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type Role = RouterOutputs['roles']['getAll'][number];

interface RoleCardProps {
  role: Role;
  onSelectRole?: (role: Role) => void;
}

export function RoleCard({ role, onSelectRole }: RoleCardProps) {
  return (
    <Card 
      className="mb-3 cursor-pointer hover:bg-muted/10 transition-colors"
      onClick={() => onSelectRole?.(role)}
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
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}