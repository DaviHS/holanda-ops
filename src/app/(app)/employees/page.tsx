'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Users } from 'lucide-react';
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
import { EmployeeCard } from './_components/employee-card';
import {
  EmployeeFormDialog,
  type EmployeeFormValues,
} from './_components/employee-form-dialog';

type Employee = RouterOutputs['employee']['list'][number];

const ALL = 'all';
const NONE = 'none';

const plain = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export default function EmployeesPage() {
  const { can } = usePermissions();
  const canManage = can('employees.manage');
  const dialog = useEntityDialog<Employee>({ fromUrl: true });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  // Vem preenchido quando se chega por um atalho, ex.: /employees?turno=<id> (tela de turnos).
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Atalho da tela de turnos: /employees?editar=<id> abre o cadastro daquele funcionário.
  const editId = params.get('editar');
  const [shiftFilter, setShiftFilter] = useState(params.get('turno') ?? ALL);
  const [sectorFilter, setSectorFilter] = useState(params.get('setor') ?? ALL);

  const utils = api.useUtils();
  const { data: items = [], isLoading } = api.employee.list.useQuery();
  const { data: sectors = [] } = api.sector.list.useQuery();
  const { data: shifts = [] } = api.shift.list.useQuery();

  // Turnos mostram a contagem de funcionários, então também precisam ser recarregados.
  const refresh = () =>
    Promise.all([
      utils.employee.list.invalidate(),
      utils.shift.list.invalidate(),
    ]);

  const createMutation = api.employee.create.useMutation(
    mutationFeedback({
      success: 'Colaborador cadastrado com sucesso!',
      error: 'Erro ao cadastrar colaborador',
      onSuccess: refresh,
    }),
  );
  const updateMutation = api.employee.update.useMutation(
    mutationFeedback({
      success: 'Colaborador atualizado com sucesso!',
      error: 'Erro ao atualizar colaborador',
      onSuccess: refresh,
    }),
  );
  const deleteMutation = api.employee.delete.useMutation(
    mutationFeedback({
      success: 'Colaborador removido com sucesso!',
      error: 'Erro ao remover colaborador',
      onSuccess: refresh,
    }),
  );

  const query = plain(search.trim());
  const filtered = items.filter(
    (item) =>
      (plain(item.name).includes(query) || item.cpf.includes(search.trim())) &&
      (shiftFilter === ALL ||
        (shiftFilter === NONE
          ? !item.shiftId
          : item.shiftId === shiftFilter)) &&
      (sectorFilter === ALL ||
        (sectorFilter === NONE
          ? item.sectorIds.length === 0
          : item.sectorIds.includes(sectorFilter))),
  );

  const [dismissedEdit, setDismissedEdit] = useState<string | null>(null);
  const urlTarget =
    editId && editId !== dismissedEdit
      ? (items.find((item) => item.id === editId) ?? null)
      : null;
  const dialogOpen = dialog.open || !!urlTarget;
  const editingTarget = dialog.open ? dialog.editing : urlTarget;

  const handleDialogChange = (open: boolean) => {
    if (!open && !dialog.open && urlTarget) {
      setDismissedEdit(urlTarget.id);
      router.replace(pathname, { scroll: false });
      return;
    }
    dialog.onOpenChange(open);
  };

  const handleSubmit = async (data: EmployeeFormValues) => {
    if (editingTarget) {
      await updateMutation.mutateAsync({ id: editingTarget.id, ...data });
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
            <Button onClick={dialog.openCreate}>
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
          placeholder="Buscar por nome ou CPF..."
          aria-label="Buscar por nome ou CPF"
        />
        <Select
          value={shiftFilter}
          onValueChange={(value) => setShiftFilter(value ?? ALL)}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Turno">
            <SelectValue>
              {shiftFilter === ALL
                ? 'Todos os turnos'
                : shiftFilter === NONE
                  ? 'Sem turno'
                  : (shifts.find((shift) => shift.id === shiftFilter)?.name ??
                    'Turno')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os turnos</SelectItem>
            <SelectItem value={NONE}>Sem turno</SelectItem>
            {shifts.map((shift) => (
              <SelectItem key={shift.id} value={shift.id}>
                {shift.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sectorFilter}
          onValueChange={(value) => setSectorFilter(value ?? ALL)}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Setor">
            <SelectValue>
              {sectorFilter === ALL
                ? 'Todos os setores'
                : sectorFilter === NONE
                  ? 'Sem setor'
                  : (sectors.find((sector) => sector.id === sectorFilter)
                      ?.name ?? 'Setor')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os setores</SelectItem>
            <SelectItem value={NONE}>Sem setor</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum funcionário encontrado"
          description="Cadastre o primeiro funcionário ou ajuste a busca e os filtros."
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((item) => (
            <EmployeeCard
              key={item.id}
              employee={item}
              onEdit={canManage ? dialog.openEdit : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {canManage && (
        <EmployeeFormDialog
          open={dialogOpen}
          onOpenChange={handleDialogChange}
          editing={editingTarget}
          sectors={sectors}
          shifts={shifts}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  );
}
