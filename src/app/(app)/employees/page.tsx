'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CheckSquare, Download, Plus, Users, X } from 'lucide-react';
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
import { onlyDigits } from '@/lib/formatters/cpf';
import {
  EMPLOYEE_STATUS,
  EMPLOYEE_STATUSES,
  type EmployeeStatus,
} from '@/lib/employee-status';
import { EmployeeCard } from './_components/employee-card';
import { EmployeeExportDialog } from './_components/employee-export-dialog';
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
  const [exportOpen, setExportOpen] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [pickedIds, setPickedIds] = useState<Set<string>>(new Set());

  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const editId = params.get('editar');
  const [shiftFilter, setShiftFilter] = useState(params.get('turno') ?? ALL);
  const [sectorFilter, setSectorFilter] = useState(params.get('setor') ?? ALL);
  const [statusFilter, setStatusFilter] = useState(params.get('status') ?? ALL);

  const utils = api.useUtils();
  const { data: items = [], isLoading } = api.employee.list.useQuery();
  const { data: sectors = [] } = api.sector.list.useQuery();
  const { data: shifts = [] } = api.shift.list.useQuery();

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
  const digits = onlyDigits(search);
  const statusCount = (status: EmployeeStatus) =>
    items.filter((item) => item.status === status).length;
  const shiftCount = (id: string) =>
    items.filter((item) => (id === NONE ? !item.shiftId : item.shiftId === id))
      .length;
  const sectorCount = (id: string) =>
    items.filter((item) =>
      id === NONE ? item.sectorIds.length === 0 : item.sectorIds.includes(id),
    ).length;
  const filtered = items.filter(
    (item) =>
      (plain(item.name).includes(query) ||
        (digits.length > 0 && onlyDigits(item.cpf).includes(digits))) &&
      (statusFilter === ALL || item.status === statusFilter) &&
      (shiftFilter === ALL ||
        (shiftFilter === NONE
          ? !item.shiftId
          : item.shiftId === shiftFilter)) &&
      (sectorFilter === ALL ||
        (sectorFilter === NONE
          ? item.sectorIds.length === 0
          : item.sectorIds.includes(sectorFilter))),
  );

  const picked = items.filter((item) => pickedIds.has(item.id));
  const allFilteredPicked =
    filtered.length > 0 && filtered.every((item) => pickedIds.has(item.id));
  const setPicked = (employee: Employee, on: boolean) =>
    setPickedIds((current) => {
      const next = new Set(current);
      if (on) next.add(employee.id);
      else next.delete(employee.id);
      return next;
    });
  const toggleFiltered = () =>
    setPickedIds((current) => {
      const next = new Set(current);
      for (const item of filtered) {
        if (allFilteredPicked) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  const endSelection = () => {
    setSelectMode(false);
    setPickedIds(new Set());
  };

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

  const handleApprove = (item: Employee) =>
    dialog.openEdit({ ...item, status: 'active' });

  const handleDelete = async (item: Employee) => {
    const confirmed = await confirm({
      title: 'Remover funcionário',
      description:
        `Tem certeza de que deseja remover "${item.name}"? Esta ação não poderá ser desfeita.` +
        (item.userId
          ? ' A conta de acesso ao sistema vinculada a ele será desativada.'
          : ''),
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
            <>
              <Button
                variant="outline"
                onClick={() => setExportOpen(true)}
                disabled={items.length === 0}
                aria-label="Exportar lista"
              >
                <Download className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button onClick={dialog.openCreate}>
                <Plus className="mr-2 size-4" />
                Novo
              </Button>
            </>
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
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? ALL)}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Situação">
            <SelectValue>
              {statusFilter === ALL
                ? 'Todas as situações'
                : `${EMPLOYEE_STATUS[statusFilter as EmployeeStatus]?.label ?? 'Situação'} (${statusCount(statusFilter as EmployeeStatus)})`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as situações</SelectItem>
            {EMPLOYEE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {EMPLOYEE_STATUS[status].label} ({statusCount(status)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={shiftFilter}
          onValueChange={(value) => setShiftFilter(value ?? ALL)}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Turno">
            <SelectValue>
              {shiftFilter === ALL
                ? 'Todos os turnos'
                : `${
                    shiftFilter === NONE
                      ? 'Sem turno'
                      : (shifts.find((shift) => shift.id === shiftFilter)
                          ?.name ?? 'Turno')
                  } (${shiftCount(shiftFilter)})`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os turnos</SelectItem>
            <SelectItem value={NONE}>Sem turno ({shiftCount(NONE)})</SelectItem>
            {shifts.map((shift) => (
              <SelectItem key={shift.id} value={shift.id}>
                {shift.name} ({shiftCount(shift.id)})
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
                : `${
                    sectorFilter === NONE
                      ? 'Sem setor'
                      : (sectors.find((sector) => sector.id === sectorFilter)
                          ?.name ?? 'Setor')
                  } (${sectorCount(sectorFilter)})`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os setores</SelectItem>
            <SelectItem value={NONE}>
              Sem setor ({sectorCount(NONE)})
            </SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name} ({sectorCount(sector.id)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {canManage && !isLoading && items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {selectMode ? (
            <>
              <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
                <span className="text-sm font-medium">
                  {picked.length} marcado(s)
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="sm:hidden"
                  onClick={endSelection}
                >
                  <X className="mr-1.5 size-3.5" />
                  Concluir
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={toggleFiltered}
                disabled={filtered.length === 0}
              >
                {allFilteredPicked
                  ? `Desmarcar os ${filtered.length} da lista`
                  : `Marcar os ${filtered.length} da lista`}
              </Button>
              {picked.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => setPickedIds(new Set())}
                >
                  Limpar marcados
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                className="w-full sm:ml-auto sm:w-auto"
                onClick={() => setExportOpen(true)}
                disabled={picked.length === 0}
              >
                <Download className="mr-1.5 size-3.5" />
                Exportar {picked.length}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={endSelection}
              >
                <X className="mr-1.5 size-3.5" />
                Concluir
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectMode(true)}
            >
              <CheckSquare className="mr-1.5 size-3.5" />
              Selecionar
            </Button>
          )}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {filtered.length === items.length
            ? `${items.length} funcionário(s)`
            : `${filtered.length} de ${items.length} funcionário(s)`}
          {statusCount('pending') > 0 && statusFilter !== 'pending' && (
            <>
              {' · '}
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className="text-primary underline-offset-2 hover:underline"
              >
                {statusCount('pending')} aguardando aprovação
              </button>
            </>
          )}
        </p>
      )}

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
              onView={canManage ? undefined : dialog.openEdit}
              onDelete={canManage ? handleDelete : undefined}
              onApprove={canManage ? handleApprove : undefined}
              selectable={selectMode}
              selected={pickedIds.has(item.id)}
              onSelectedChange={setPicked}
            />
          ))}
        </div>
      )}

      {canManage && (
        <EmployeeExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          filtered={filtered}
          all={items}
          picked={picked}
        />
      )}

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        editing={editingTarget}
        sectors={sectors}
        shifts={shifts}
        onSubmit={handleSubmit}
        readOnly={!canManage}
      />
    </PageContainer>
  );
}
