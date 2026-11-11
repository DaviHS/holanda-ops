'use client';

import { useState } from 'react';
import { Plus, UserCog } from 'lucide-react';
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
import { UserCard } from './_components/user-card';
import { UserTable } from './_components/user-table';
import {
  UserFormDialog,
  type UserFormValues,
} from './_components/user-form-dialog';

type User = RouterOutputs['user']['list'][number];

const plain = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export default function UsersPage() {
  const { can } = usePermissions();
  const canManage = can('users.manage');
  const dialog = useEntityDialog<User>({ fromUrl: true });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');

  const utils = api.useUtils();
  const { data: items = [], isLoading } = api.user.list.useQuery();

  const refresh = () => utils.user.list.invalidate();

  const createMutation = api.user.create.useMutation(
    mutationFeedback({
      success: 'Usuário criado com sucesso!',
      error: 'Erro ao criar usuário',
      onSuccess: refresh,
    }),
  );
  const updateMutation = api.user.update.useMutation(
    mutationFeedback({
      success: 'Usuário atualizado com sucesso!',
      error: 'Erro ao atualizar usuário',
      onSuccess: refresh,
    }),
  );
  const deleteMutation = api.user.delete.useMutation(
    mutationFeedback({
      success: 'Usuário removido com sucesso!',
      error: 'Erro ao remover usuário',
      onSuccess: refresh,
    }),
  );

  const query = plain(search.trim());
  const filtered = items.filter((item) =>
    plain(`${item.employee?.name ?? ''} ${item.email}`).includes(query),
  );

  const handleSubmit = async (data: UserFormValues) => {
    if (dialog.editing) {
      await updateMutation.mutateAsync({ id: dialog.editing.id, ...data });
    } else {
      await createMutation.mutateAsync({
        ...data,
        password: data.password ?? '',
      });
    }
  };

  const handleDelete = async (item: User) => {
    const confirmed = await confirm({
      title: 'Remover usuário',
      description: `Tem certeza de que deseja remover o acesso de "${item.email}"? Esta ação não poderá ser desfeita.`,
      confirmLabel: 'Remover',
      destructive: true,
    });
    if (confirmed) deleteMutation.mutate({ id: item.id });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Usuários do Sistema"
        icon={UserCog}
        description="Gerencie os acessos de usuários vinculados aos funcionários da organização."
        actions={
          canManage && (
            <Button onClick={dialog.openCreate} className="h-10">
              <Plus className="mr-2 size-4" />
              Novo
            </Button>
          )
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nome ou e-mail..."
        aria-label="Buscar por nome ou e-mail"
      />

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Nenhum usuário encontrado"
          description="Crie o primeiro acesso ou ajuste a busca."
        />
      ) : (
        <>
          <div className="sm:hidden">
            {filtered.map((item) => (
              <UserCard
                key={item.id}
                user={item}
                onEdit={canManage ? dialog.openEdit : undefined}
                onDelete={canManage ? handleDelete : undefined}
              />
            ))}
          </div>

          <div className="hidden sm:block">
            <UserTable
              users={filtered}
              onEdit={canManage ? dialog.openEdit : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          </div>
        </>
      )}

      {canManage && (
        <UserFormDialog
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          editing={dialog.editing}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  );
}
