'use client';

import { KeyRound, ShieldCheck, Users } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import { EntityCard } from '@/components/entity-card';
import { RowActions } from '@/components/row-actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

type Role = RouterOutputs['role']['list'][number];

interface RoleCardProps {
  role: Role;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;

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
      subtitle={
        <span className="inline-flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1"
            title="Usuários com este cargo"
          >
            <Users className="size-3" aria-hidden />
            {role.userCount}
            <span className="sr-only">
              {role.userCount === 1 ? 'usuário' : 'usuários'}
            </span>
          </span>
          <span
            className="inline-flex items-center gap-1"
            title="Permissões do cargo"
          >
            <KeyRound className="size-3" aria-hidden />
            {role.permissionCount}
            <span className="sr-only">
              {role.permissionCount === 1 ? 'permissão' : 'permissões'}
            </span>
          </span>
        </span>
      }
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
