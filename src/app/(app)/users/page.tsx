'use client';

import { useState } from 'react';
import { api, type RouterOutputs } from '@/trpc/react';
import { UserCard } from './_components/user-card';
import { UserTable } from './_components/user-table';
import { UserToolbar } from './_components/user-toolbar';
import { UserFormDialog, type UserFormValues } from './_components/user-form-dialog';

type User = RouterOutputs['users']['getAll'][number];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const utils = api.useUtils();
  const { data: users = [], isLoading } = api.users.getAll.useQuery();

  const createMutation = api.users.create.useMutation({
    onSuccess: () => {
      void utils.users.getAll.invalidate();
      setDialogOpen(false);
    },
  });

  const updateMutation = api.users.update.useMutation({
    onSuccess: () => {
      void utils.users.getAll.invalidate();
      setDialogOpen(false);
    },
  });

  const filtered = users.filter((u) => {
    const searchTerm = search.toLowerCase();
    const employeeName = u.employee?.name?.toLowerCase() ?? '';
    const email = u.email.toLowerCase();

    return employeeName.includes(searchTerm) || email.includes(searchTerm);
  });

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSubmitForm = async (data: UserFormValues) => {
    if (selectedUser) {
      await updateMutation.mutateAsync({
        id: selectedUser.id,
        ...data,
      });
    } else {
      await createMutation.mutateAsync({
        ...data,
        password: data.password ?? '',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários do Sistema</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os acessos de usuários vinculados aos funcionários da organização.
        </p>
      </div>

      <UserToolbar
        search={search}
        onSearchChange={setSearch}
        onNewClick={handleOpenCreate}
      />

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Carregando usuários...
        </div>
      ) : (
        <>
          <div className="block sm:hidden">
            {filtered.map((user) => (
              <div key={user.id} onClick={() => handleOpenEdit(user)} className="cursor-pointer">
                <UserCard user={user} />
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <UserTable users={filtered} onSelectUser={handleOpenEdit} />
          </div>
        </>
      )}

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}