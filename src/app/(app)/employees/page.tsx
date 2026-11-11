'use client';

import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
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
import { EmployeeCard } from './_components/employee-card';
import { EmployeeTable } from './_components/employee-table';
import { EmployeeFormDialog, type EmployeeFormValues } from './_components/employee-form-dialog';

type Employee = RouterOutputs['employee']['list'][number];

const plain = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export default function EmployeesPage() {
  const { can } = usePermissions();
  const canManage = can('employees.manage');
  const dialog = useEntityDialog<Employee>({ fromUrl: true });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');

  const utils = api.useUtils();
  const { data: items = [], isLoading } = api.employee.list.useQuery();
  const { data: sectors = [] } = api.sector.list.useQuery();
  const { data: shifts = [] } = api.shift.list.useQuery();

  const refresh = () => utils.employee.list.invalidate();

  const createMutation = api.employee.create.useMutation(
    mutationFeedback({ success: 'Colaborador cadastrado com sucesso!', error: 'Erro ao cadastrar colaborador', onSuccess: refresh }),
  );
  const updateMutation = api.employee.update.useMutation(
    mutationFeedback({ success: 'Colaborador atualizado com sucesso!', error: 'Erro ao atualizar colaborador', onSuccess: refresh }),
  );
  const deleteMutation = api.employee.delete.useMutation(
    mutationFeedback({ success: 'Colaborador removido com sucesso!', error: 'Erro ao remover colaborador', onSuccess: refresh }),
  );

  const query = plain(search.trim());
  const filtered = items.filter((item) => plain(item.name).includes(query) || item.cpf.includes(search.trim()));

  const handleSubmit = async (data: EmployeeFormValues) => {
    if (dialog.editing) {
      await updateMutation.mutateAsync({ id: dialog.editing.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (item: Employee) => {
    const confirmed = await confirm({
      title: 'Remover funcionário',
      description: `Tem certeza de que deseja remover "${item.name}"? Esta ação não poderá ser desfeita.`,
      confirmLabel: 'Remover',
      destructive: true,
    });
    if (confirmed) deleteMutation.mutate({ id: item.id });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Funcionários"
        icon={Users}
        description="Gerencie todos os colaboradores, uniformes e dados pessoais."
        actions={
          canManage && (
            <Button onClick={dialog.openCreate} className="h-10">
              <Plus className="mr-2 size-4" />
              Novo
            </Button>
          )
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome ou CPF..." aria-label="Buscar por nome ou CPF" />

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum funcionário encontrado" description="Cadastre o primeiro funcionário ou ajuste a busca." />
      ) : (
        <>
          <div className="sm:hidden">
            {filtered.map((item) => (
              <EmployeeCard
                key={item.id}
                employee={item}
                onEdit={canManage ? dialog.openEdit : undefined}
                onDelete={canManage ? handleDelete : undefined}
              />
            ))}
          </div>

          <div className="hidden sm:block">
            <EmployeeTable
              employees={filtered}
              onEdit={canManage ? dialog.openEdit : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          </div>
        </>
      )}

      {canManage && (
        <EmployeeFormDialog
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          editing={dialog.editing}
          sectors={sectors}
          shifts={shifts}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  );
}
