'use client';

import { useState } from 'react';
import { api, type RouterOutputs } from '@/trpc/react';
import { RoleCard } from './_components/role-card';
import { RoleTable } from './_components/role-table';
import { RoleToolbar } from './_components/role-toolbar';
import { RoleFormDialog, type RoleFormValues } from './_components/role-form-dialog';

type Role = RouterOutputs['roles']['getAll'][number];

export default function RolesPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const utils = api.useUtils();
  const { data: roles = [], isLoading } = api.roles.getAll.useQuery();

  const createMutation = api.roles.create.useMutation({
    onSuccess: () => {
      void utils.roles.getAll.invalidate();
      setDialogOpen(false);
    },
  });

  const updateMutation = api.roles.update.useMutation({
    onSuccess: () => {
      void utils.roles.getAll.invalidate();
      setDialogOpen(false);
    },
  });

  const filtered = roles.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setDialogOpen(true);
  };

  const handleSubmitForm = async (data: RoleFormValues) => {
    if (selectedRole) {
      await updateMutation.mutateAsync({
        id: selectedRole.id,
        ...data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cargos e Funções</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os cargos e atribuições dos colaboradores na organização.
        </p>
      </div>

      <RoleToolbar
        search={search}
        onSearchChange={setSearch}
        onNewClick={handleOpenCreate}
      />

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Carregando cargos...
        </div>
      ) : (
        <>
          <div className="block sm:hidden">
            {filtered.map((role) => (
              <div key={role.id} onClick={() => handleOpenEdit(role)} className="cursor-pointer">
                <RoleCard role={role} />
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <RoleTable roles={filtered} onSelectRole={handleOpenEdit} />
          </div>
        </>
      )}

      <RoleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={selectedRole}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}