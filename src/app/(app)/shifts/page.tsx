'use client';

import { useState } from 'react';
import { Plus, CalendarClock } from 'lucide-react';
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
import { ShiftCard } from './_components/shift-card';
import { ShiftTable } from './_components/shift-table';
import {
  ShiftFormDialog,
  type ShiftFormValues,
} from './_components/shift-form-dialog';

type Shift = RouterOutputs['shift']['list'][number];

const plain = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export default function ShiftsPage() {
  const { can } = usePermissions();
  const canManage = can('shifts.manage');
  const dialog = useEntityDialog<Shift>({ fromUrl: true });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');

  const utils = api.useUtils();
  const { data: items = [], isLoading } = api.shift.list.useQuery();

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

  const query = plain(search.trim());
  const filtered = items.filter((item) =>
    plain(`${item.name} ${item.description ?? ''}`).includes(query),
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
      description: `Tem certeza de que deseja remover o turno "${item.name}"? Esta ação não poderá ser desfeita.`,
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
        placeholder="Buscar turno..."
        aria-label="Buscar turno"
      />

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Nenhum turno encontrado"
          description="Cadastre o primeiro turno ou ajuste a busca."
        />
      ) : (
        <>
          <div className="sm:hidden">
            {filtered.map((item) => (
              <ShiftCard
                key={item.id}
                shift={item}
                onEdit={canManage ? dialog.openEdit : undefined}
                onDelete={canManage ? handleDelete : undefined}
              />
            ))}
          </div>

          <div className="hidden sm:block">
            <ShiftTable
              shifts={filtered}
              onEdit={canManage ? dialog.openEdit : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          </div>
        </>
      )}

      {canManage && (
        <ShiftFormDialog
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          editing={dialog.editing}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  );
}
