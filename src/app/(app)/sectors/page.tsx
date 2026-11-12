'use client';

import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
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
import { SectorCard } from './_components/sector-card';
import { SectorEmployeesDialog } from './_components/sector-employees-dialog';
import {
  SectorFormDialog,
  type SectorFormValues,
} from './_components/sector-form-dialog';

type Sector = RouterOutputs['sector']['list'][number];

const ALL = 'all';
const WITH = 'with';
const WITHOUT = 'without';
const OCCUPANCY_LABELS: Record<string, string> = {
  [ALL]: 'Todos os setores',
  [WITH]: 'Com funcionários',
  [WITHOUT]: 'Sem funcionários',
};

const plain = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export default function SectorsPage() {
  const { can } = usePermissions();
  const canManage = can('sectors.manage');
  const dialog = useEntityDialog<Sector>({ fromUrl: true });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [occupancy, setOccupancy] = useState(ALL);
  const [viewing, setViewing] = useState<Sector | null>(null);
  const canSeeEmployees = can('employees.view', 'employees.manage');

  const utils = api.useUtils();
  const { data: items = [], isLoading } = api.sector.list.useQuery(undefined, {
    refetchOnMount: 'always',
  });

  const refresh = () => utils.sector.list.invalidate();

  const createMutation = api.sector.create.useMutation(
    mutationFeedback({
      success: 'Setor criado com sucesso!',
      error: 'Erro ao criar setor',
      onSuccess: refresh,
    }),
  );
  const updateMutation = api.sector.update.useMutation(
    mutationFeedback({
      success: 'Setor atualizado com sucesso!',
      error: 'Erro ao atualizar setor',
      onSuccess: refresh,
    }),
  );
  const deleteMutation = api.sector.delete.useMutation(
    mutationFeedback({
      success: 'Setor removido com sucesso!',
      error: 'Erro ao remover setor',
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
      plain(`${item.name} ${item.description ?? ''}`).includes(query) &&
      (occupancy === ALL ||
        (occupancy === WITH
          ? item.employeeCount > 0
          : item.employeeCount === 0)),
  );

  const handleSubmit = async (data: SectorFormValues) => {
    if (dialog.editing) {
      await updateMutation.mutateAsync({ id: dialog.editing.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (item: Sector) => {
    const confirmed = await confirm({
      title: 'Remover setor',
      description:
        `Tem certeza de que deseja remover o setor "${item.name}"? Esta ação não poderá ser desfeita.` +
        (item.employeeCount > 0
          ? ` ${item.employeeCount} funcionário(s) perderão este setor` +
            (item.soleCount > 0
              ? `, e ${item.soleCount} ficarão sem nenhum setor.`
              : '.')
          : ''),
      confirmLabel: 'Remover',
      destructive: true,
    });
    if (confirmed) deleteMutation.mutate({ id: item.id });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Setores"
        icon={Building2}
        description="Gerencie os setores da empresa para alocação dos colaboradores."
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
          placeholder="Buscar setor..."
          aria-label="Buscar setor"
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
          icon={Building2}
          title="Nenhum setor encontrado"
          description="Cadastre o primeiro setor ou ajuste a busca."
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((item) => (
            <SectorCard
              key={item.id}
              sector={item}
              onViewEmployees={canSeeEmployees ? setViewing : undefined}
              onEdit={canManage ? dialog.openEdit : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {canManage && (
        <SectorFormDialog
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          editing={dialog.editing}
          onSubmit={handleSubmit}
        />
      )}
      {canSeeEmployees && (
        <SectorEmployeesDialog
          sector={viewing}
          onOpenChange={(open) => !open && setViewing(null)}
          canAssign={can('sectors.manage', 'employees.manage')}
          canOpenEmployee={can('employees.manage')}
        />
      )}
    </PageContainer>
  );
}
