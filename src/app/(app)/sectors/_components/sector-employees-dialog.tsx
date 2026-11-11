'use client';

import { api, type RouterOutputs } from '@/trpc/react';
import { EmployeesDialog } from '@/components/employees-dialog';
import { mutationFeedback } from '@/lib/mutation-feedback';

type Sector = RouterOutputs['sector']['list'][number];

interface SectorEmployeesDialogProps {
  sector: Sector | null;
  onOpenChange: (open: boolean) => void;
  /** Pode colocar e tirar funcionários deste setor. */
  canAssign?: boolean;
  /** Pode abrir a edição de um funcionário. */
  canOpenEmployee?: boolean;
}

/** Funcionários de um setor: ver, adicionar, remover e abrir o cadastro. */
export function SectorEmployeesDialog({
  sector,
  onOpenChange,
  canAssign = false,
  canOpenEmployee = false,
}: SectorEmployeesDialogProps) {
  const utils = api.useUtils();

  // Só os funcionários deste setor (o filtro é feito no servidor).
  const { data: members = [], isLoading } = api.employee.list.useQuery(
    { sectorId: sector?.id },
    { enabled: !!sector },
  );
  // Candidatos a entrar no setor: só carrega para quem pode adicionar.
  const { data: everyone = [] } = api.employee.list.useQuery(undefined, {
    enabled: !!sector && canAssign,
  });
  const candidates = sector
    ? everyone
        .filter((employee) => !employee.sectorIds.includes(sector.id))
        .map((employee) => ({
          id: employee.id,
          label: `${employee.name.trim()}${employee.sector ? ` · ${employee.sector}` : ''}`,
        }))
    : [];

  const refresh = () =>
    Promise.all([
      utils.employee.list.invalidate(),
      utils.sector.list.invalidate(),
    ]);

  const addMutation = api.sector.setEmployeeSector.useMutation(
    mutationFeedback({
      success: 'Funcionário adicionado ao setor!',
      error: 'Erro ao adicionar ao setor',
      onSuccess: refresh,
    }),
  );
  const removeMutation = api.sector.setEmployeeSector.useMutation(
    mutationFeedback({
      success: (data) =>
        data.remainingSectors === 0
          ? 'Removido do setor. O funcionário ficou sem nenhum setor.'
          : 'Funcionário removido do setor!',
      error: 'Erro ao remover do setor',
      onSuccess: refresh,
    }),
  );

  return (
    <EmployeesDialog
      open={!!sector}
      onOpenChange={onOpenChange}
      title={sector?.name ?? 'Setor'}
      description={
        sector && (
          <>
            {members.length}{' '}
            {members.length === 1 ? 'funcionário' : 'funcionários'}
          </>
        )
      }
      members={members}
      isLoading={isLoading}
      candidates={canAssign ? candidates : undefined}
      onAdd={
        sector
          ? (employeeId) =>
              addMutation.mutate({
                employeeId,
                sectorId: sector.id,
                assigned: true,
              })
          : undefined
      }
      onRemove={
        canAssign && sector
          ? (employeeId) =>
              removeMutation.mutate({
                employeeId,
                sectorId: sector.id,
                assigned: false,
              })
          : undefined
      }
      removeLabel="Remover do setor"
      busy={addMutation.isPending || removeMutation.isPending}
      canOpenEmployee={canOpenEmployee}
      listHref={sector ? `/employees?setor=${sector.id}` : undefined}
      emptyText="Nenhum funcionário neste setor."
    />
  );
}
