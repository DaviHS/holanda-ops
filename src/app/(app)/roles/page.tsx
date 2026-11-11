'use client';

import { useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { PageContainer, PageHeader } from '@/components/page-header';
import { SearchInput } from '@/components/search-input';
import { useConfirm } from '@/components/confirm-dialog';
import { useEntityDialog } from '@/hooks/use-entity-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { mutationFeedback } from '@/lib/mutation-feedback';
import type { Permission } from '@/lib/permissions';
import { RoleCard } from './_components/role-card';
import { RoleTable } from './_components/role-table';
import {
  RoleFormDialog,
  type RoleFormValues,
} from './_components/role-form-dialog';

type Role = RouterOutputs['role']['list'][number];

const plain = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export default function RolesPage() {
  const { can } = usePermissions();
  const canManage = can('roles.manage');
  const dialog = useEntityDialog<Role>({ fromUrl: true });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');

  const utils = api.useUtils();
  const { data: items = [], isLoading } = api.role.list.useQuery();

  const { data: permissionsByRole = {} } =
    api.access.listRolePermissions.useQuery(undefined, { enabled: canManage });

  const refresh = () => utils.role.list.invalidate();
  const setPermissionsMutation = api.access.setRolePermissions.useMutation(
    mutationFeedback({
      error: 'Erro ao salvar as permissões',
      onSuccess: () => utils.access.listRolePermissions.invalidate(),
    }),
  );

  const createMutation = api.role.create.useMutation(
    mutationFeedback({
      success: 'Cargo criado com sucesso!',
      error: 'Erro ao criar cargo',
      onSuccess: refresh,
    }),
  );
  const updateMutation = api.role.update.useMutation(
    mutationFeedback({
      success: 'Cargo atualizado com sucesso!',
      error: 'Erro ao atualizar cargo',
      onSuccess: refresh,
    }),
  );
  const deleteMutation = api.role.delete.useMutation(
    mutationFeedback({
      success: 'Cargo removido com sucesso!',
      error: 'Erro ao remover cargo',
      onSuccess: refresh,
    }),
  );

  const query = plain(search.trim());
  const filtered = items.filter((item) =>
    plain(`${item.name} ${item.description ?? ''}`).includes(query),
  );

  const handleSubmit = async (
    data: RoleFormValues,
    permissions: Permission[],
  ) => {
    const saved = dialog.editing
      ? await updateMutation.mutateAsync({ id: dialog.editing.id, ...data })
      : await createMutation.mutateAsync(data);
    if (saved)
      await setPermissionsMutation.mutateAsync({
        roleId: saved.id,
        permissions,
      });
  };

  const handleDelete = async (item: Role) => {
    const confirmed = await confirm({
      title: 'Remover cargo',
      description: `Tem certeza de que deseja remover o cargo "${item.name}"? Esta ação não poderá ser desfeita.`,
      confirmLabel: 'Remover',
      destructive: true,
    });
    if (confirmed) deleteMutation.mutate({ id: item.id });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Cargos e Permissões"
        icon={ShieldCheck}
        description="Gerencie os cargos e defina o que cada um pode fazer no sistema."
        actions={
          canManage && (
            <Button onClick={dialog.openCreate}>
              <Plus className="mr-2 size-4" />
              Novo
            </Button>
          )
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar cargo..."
        aria-label="Buscar cargo"
      />

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nenhum cargo encontrado"
          description="Cadastre o primeiro cargo ou ajuste a busca."
        />
      ) : (
        <>
          <div className="sm:hidden">
            {filtered.map((item) => (
              <RoleCard
                key={item.id}
                role={item}
                onEdit={canManage ? dialog.openEdit : undefined}
                onDelete={canManage ? handleDelete : undefined}
              />
            ))}
          </div>

          <div className="hidden sm:block">
            <RoleTable
              roles={filtered}
              onEdit={canManage ? dialog.openEdit : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          </div>
        </>
      )}

      {canManage && (
        <RoleFormDialog
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          editing={dialog.editing}
          permissions={
            dialog.editing ? (permissionsByRole[dialog.editing.id] ?? []) : []
          }
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  );
}
