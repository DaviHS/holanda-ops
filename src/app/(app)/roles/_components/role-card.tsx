'use client';

import { ShieldCheck, Users } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import { EntityCard } from '@/components/entity-card';
import { RowActions } from '@/components/row-actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

type Role = RouterOutputs['role']['list'][number];

interface RoleCardProps {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
  /** Abre a lista de usuários que têm este cargo. */
  onViewUsers?: (role: Role) => void;
}

export function RoleCard({
  role,
  onEdit,
  onDelete,
  onViewUsers,
}: RoleCardProps) {
  const canView = !!onViewUsers && role.userCount > 0;

  return (
    <EntityCard
      icon={ShieldCheck}
      title={role.name}
      subtitle={`${role.userCount} usuário(s) · ${role.permissionCount} permissão(ões)`}
      onOpen={onEdit && (() => onEdit(role))}
      actions={
        <RowActions
          compact
          label={role.name}
          onEdit={onEdit && (() => onEdit(role))}
          onDelete={onDelete && (() => onDelete(role))}
        >
          {canView && (
            <DropdownMenuItem onClick={() => onViewUsers(role)}>
              <Users className="mr-2 size-4" /> Usuários
            </DropdownMenuItem>
          )}
        </RowActions>
      }
    >
      {role.description && (
        <p className="text-muted-foreground line-clamp-2 text-xs break-words">
          {role.description}
        </p>
      )}
    </EntityCard>
  );
}
