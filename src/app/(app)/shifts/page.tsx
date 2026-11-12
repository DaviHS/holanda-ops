'use client';

import { useState } from 'react';
import { Plus, CalendarClock } from 'lucide-react';
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
import { formatShiftTime } from '@/lib/formatters';
import { mutationFeedback } from '@/lib/mutation-feedback';
import { ShiftCard } from './_components/shift-card';
import { ShiftEmployeesDialog } from './_components/shift-employees-dialog';
import {
  ShiftFormDialog,
  type ShiftFormValues,
} from './_components/shift-form-dialog';

type Shift = RouterOutputs['shift']['list'][number];

const ALL = 'all';
const WITH = 'with';
const WITHOUT = 'without';
const OCCUPANCY_LABELS: Record<string, string> = {
  [ALL]: 'Todos os turnos',
  [WITH]: 'Com funcionários',
  [WITHOUT]: 'Sem funcionários',
};

const plain = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export default function ShiftsPage() {
  const { can } = usePermissions();
  const canManage = can('shifts.manage');
  const canSeeEmployees = can('employees.view', 'employees.manage');
  const [viewing, setViewing] = useState<Shift | null>(null);
  const [occupancy, setOccupancy] = useState(ALL);
  const canAssign = can('shifts.manage', 'employees.manage');
  const dialog = useEntityDialog<Shift>({ fromUrl: true });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');

  const utils = api.useUtils();
  const { data: items = [], isLoading } = api.shift.list.useQuery(undefined, {
    refetchOnMount: 'always',
  });

  const refresh = () => utils.shift.list.invalidate();

  const createMutation = api.shift.create.useMutation(
    mutationFeedback({
      success: 'Turno criado com sucesso!',
      error: 'Erro ao criar turno',
      onSuccess: refresh,
    }),
  );
  const updateMutation = api.shift.update.useMutation(
    mutationFeedback({
      success: 'Turno atualizado com sucesso!',
      error: 'Erro ao atualizar turno',
      onSuccess: refresh,
    }),
  );
  const deleteMutation = api.shift.delete.useMutation(
    mutationFeedback({
      success: 'Turno removido com sucesso!',
      error: 'Erro ao remover turno',
      onSuccess: refresh,
    }),
  );

  const occupancyCount = (value: string) =>
    items.filter((item) =>
      value === WITH ? item.employeeCount > 0 : item.employeeCount === 0,
    ).length;

  const query = plain(search.trim());
  const filtered = items.filter(
    (item) =>
      plain(
        `${item.name} ${item.description ?? ''} ${formatShiftTime(item)}`,
      ).includes(query) &&
      (occupancy === ALL ||
        (occupancy === WITH
          ? item.employeeCount > 0
          : item.employeeCount === 0)),
  );

  const handleSubmit = async (data: ShiftFormValues) => {
    if (dialog.editing) {
      await updateMutation.mutateAsync({ id: dialog.editing.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (item: Shift) => {
    const confirmed = await confirm({
      title: 'Remover turno',
      description:
        `Tem certeza de que deseja remover o turno "${item.name}"? Esta ação não poderá ser desfeita.` +
        (item.employeeCount > 0
          ? ` ${item.employeeCount} funcionário(s) ficarão sem turno.`
          : ''),
      confirmLabel: 'Remover',
      destructive: true,
    });
    if (confirmed) deleteMutation.mutate({ id: item.id });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Turnos"
        icon={CalendarClock}
        description="Gerencie os turnos e horários de trabalho dos colaboradores."
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
          placeholder="Buscar por nome, horário ou descrição..."
          aria-label="Buscar turno"
        />
        <Select
          value={occupancy}
          onValueChange={(value) => setOccupancy(value ?? ALL)}
        >
          <SelectTrigger className="w-full sm:w-52" aria-label="Funcionários">
            <SelectValue>
              {occupancy === ALL
                ? OCCUPANCY_LABELS[occupancy]
                : `${OCCUPANCY_LABELS[occupancy]} (${occupancyCount(occupancy)})`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(OCCUPANCY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
                {value !== ALL && ` (${occupancyCount(value)})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Nenhum turno encontrado"
          description="Cadastre o primeiro turno ou ajuste a busca."
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((item) => (
            <ShiftCard
              key={item.id}
              onViewEmployees={canSeeEmployees ? setViewing : undefined}
              shift={item}
              onEdit={canManage ? dialog.openEdit : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {canManage && (
        <ShiftFormDialog
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          editing={dialog.editing}
          onSubmit={handleSubmit}
        />
      )}
      {canSeeEmployees && (
        <ShiftEmployeesDialog
          shift={viewing}
          onOpenChange={(open) => !open && setViewing(null)}
          canAssign={canAssign}
          canOpenEmployee={can('employees.manage')}
        />
      )}
    </PageContainer>
  );
}
