'use client';

import { type RouterOutputs } from '@/trpc/react';
import { ShieldCheck } from 'lucide-react';
import {
  RowActions,
  editableRowProps,
  stopRowEvent,
} from '@/components/row-actions';
import { Card, CardContent } from '@/components/ui/card';

type Role = RouterOutputs['role']['list'][number];

interface RoleCardProps {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  return (
    <Card
      {...editableRowProps(onEdit && (() => onEdit(role)))}
      className="hover:bg-muted/10 mb-2 cursor-pointer transition-colors"
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
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
          <div className="shrink-0" onClick={stopRowEvent}>
            <RowActions
              compact
              label={role.name}
              onEdit={onEdit && (() => onEdit(role))}
              onDelete={onDelete && (() => onDelete(role))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
