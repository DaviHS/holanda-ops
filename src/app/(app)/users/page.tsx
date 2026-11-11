'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, UserCog } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageContainer, PageHeader } from '@/components/page-header';
import { SearchInput } from '@/components/search-input';
import { useConfirm } from '@/components/confirm-dialog';
import { useEntityDialog } from '@/hooks/use-entity-dialog';
import { usePermissions } from '@/hooks/use-permissions';
import { mutationFeedback } from '@/lib/mutation-feedback';
import { USER_STATUS, userStatusLabel } from '@/lib/user-status';
import { UserCard } from './_components/user-card';
import { UserTable } from './_components/user-table';
import {
  UserFormDialog,
  type UserFormValues,
} from './_components/user-form-dialog';

type User = RouterOutputs['user']['list'][number];

const ALL = 'all';

const plain = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export default function UsersPage() {
  const { can } = usePermissions();
  const { data: session } = useSession();
  const canManage = can('users.manage');
  const dialog = useEntityDialog<User>({ fromUrl: true });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);

  const utils = api.useUtils();
  const { data: items = [], isLoading } = api.user.list.useQuery();
  const { data: roles = [] } = api.role.list.useQuery();

  const refresh = () => utils.user.list.invalidate();

  const createMutation = api.user.create.useMutation(
    mutationFeedback({
      success: (data) =>
        data.resetEmailSent === false
          ? 'Usuário criado, mas o e-mail com o link de senha não foi enviado. Use "Enviar link de senha".'
          : data.resetEmailSent
            ? 'Usuário criado! Enviamos um link por e-mail para ele criar a senha.'
            : 'Usuário criado com sucesso!',
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
  const resetMutation = api.user.sendPasswordReset.useMutation(
    mutationFeedback({
      loading: 'Enviando link...',
      success: 'Link de redefinição enviado por e-mail!',
      error: 'Erro ao enviar o link',
    }),
  );

  const query = plain(search.trim());
  const filtered = items.filter(
    (item) =>
      plain(`${item.employee?.name ?? ''} ${item.email}`).includes(query) &&
      (roleFilter === ALL || item.roleId === roleFilter) &&
      (statusFilter === ALL || item.status === statusFilter),
  );

  const handleSubmit = async (data: UserFormValues) => {
    if (dialog.editing) {
      await updateMutation.mutateAsync({ id: dialog.editing.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
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

  const handleSendReset = async (item: User) => {
    const confirmed = await confirm({
      title: 'Enviar link de senha',
      description: `Enviaremos para "${item.email}" um link, válido por 1 hora, para criar uma nova senha. A senha atual continua valendo até ela ser trocada.`,
      confirmLabel: 'Enviar link',
    });
    if (confirmed) resetMutation.mutate({ id: item.id });
  };

  const actions = {
    onEdit: canManage ? dialog.openEdit : undefined,
    onSendReset: canManage ? handleSendReset : undefined,
    onDelete: canManage ? handleDelete : undefined,
    currentUserId: session?.user?.id,
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

      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome ou e-mail..."
          aria-label="Buscar por nome ou e-mail"
        />
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value ?? ALL)}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Cargo">
            <SelectValue>
              {roleFilter === ALL
                ? 'Todos os cargos'
                : (roles.find((role) => role.id === roleFilter)?.name ??
                  'Cargo')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os cargos</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? ALL)}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Status">
            <SelectValue>
              {statusFilter === ALL
                ? 'Todos os status'
                : userStatusLabel(statusFilter)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os status</SelectItem>
            {Object.entries(USER_STATUS).map(([status, { label }]) => (
              <SelectItem key={status} value={status}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Nenhum usuário encontrado"
          description="Crie o primeiro acesso ou ajuste a busca e os filtros."
        />
      ) : (
        <>
          <div className="sm:hidden">
            {filtered.map((item) => (
              <UserCard key={item.id} user={item} {...actions} />
            ))}
          </div>

          <div className="hidden sm:block">
            <UserTable users={filtered} {...actions} />
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
