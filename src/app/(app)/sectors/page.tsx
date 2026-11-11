'use client';

import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
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
import { SectorCard } from './_components/sector-card';
import { SectorTable } from './_components/sector-table';
import {
  SectorFormDialog,
  type SectorFormValues,
} from './_components/sector-form-dialog';

type Sector = RouterOutputs['sector']['list'][number];

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

  const utils = api.useUtils();
  const { data: items = [], isLoading } = api.sector.list.useQuery();

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

  const query = plain(search.trim());
  const filtered = items.filter((item) =>
    plain(`${item.name} ${item.description ?? ''}`).includes(query),
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
      description: `Tem certeza de que deseja remover o setor "${item.name}"? Esta ação não poderá ser desfeita.`,
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

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar setor..."
        aria-label="Buscar setor"
      />

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhum setor encontrado"
          description="Cadastre o primeiro setor ou ajuste a busca."
        />
      ) : (
        <>
          <div className="sm:hidden">
            {filtered.map((item) => (
              <SectorCard
                key={item.id}
                sector={item}
                onEdit={canManage ? dialog.openEdit : undefined}
                onDelete={canManage ? handleDelete : undefined}
              />
            ))}
          </div>

          <div className="hidden sm:block">
            <SectorTable
              sectors={filtered}
              onEdit={canManage ? dialog.openEdit : undefined}
              onDelete={canManage ? handleDelete : undefined}
            />
          </div>
        </>
      )}

      {canManage && (
        <SectorFormDialog
          open={dialog.open}
          onOpenChange={dialog.onOpenChange}
          editing={dialog.editing}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  );
}
