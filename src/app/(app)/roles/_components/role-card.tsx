'use client';

import { ShieldCheck } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import { EntityCard } from '@/components/entity-card';
import { RowActions } from '@/components/row-actions';

type Role = RouterOutputs['role']['list'][number];

interface RoleCardProps {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  return (
    <EntityCard
      icon={ShieldCheck}
      title={role.name}
      subtitle={role.description}
      onOpen={onEdit && (() => onEdit(role))}
      actions={
        <RowActions
          compact
          label={role.name}
          onEdit={onEdit && (() => onEdit(role))}
          onDelete={onDelete && (() => onDelete(role))}
        />
      }
    />
  );
}
