'use client';

import { api, type RouterOutputs } from '@/trpc/react';
import { EmployeesDialog } from '@/components/employees-dialog';
import { formatShiftTime } from '@/lib/formatters';
import { mutationFeedback } from '@/lib/mutation-feedback';

type Shift = RouterOutputs['shift']['list'][number];

interface ShiftEmployeesDialogProps {
  shift: Shift | null;
  onOpenChange: (open: boolean) => void;

  canAssign?: boolean;

  canOpenEmployee?: boolean;
}

export function ShiftEmployeesDialog({
  shift,
  onOpenChange,
  canAssign = false,
  canOpenEmployee = false,
}: ShiftEmployeesDialogProps) {
  const utils = api.useUtils();

  const { data: members = [], isLoading } = api.employee.list.useQuery(
    { shiftId: shift?.id },
    { enabled: !!shift },
  );

  const { data: everyone = [] } = api.employee.list.useQuery(undefined, {
    enabled: !!shift && canAssign,
  });
  const candidates = shift
    ? everyone
        .filter((employee) => employee.shiftId !== shift.id)
        .map((employee) => ({
          id: employee.id,
          label: `${employee.name.trim()}${employee.shift ? ` · ${employee.shift.name}` : ''}`,
        }))
    : [];

  const refresh = () =>
    Promise.all([
      utils.employee.list.invalidate(),
      utils.shift.list.invalidate(),
    ]);

  const addMutation = api.shift.setEmployeeShift.useMutation(
    mutationFeedback({
      success: (data) =>
        data.previousShift
          ? `Movido de "${data.previousShift}" para "${shift?.name ?? 'este turno'}"!`
          : 'Funcionário adicionado ao turno!',
      error: 'Erro ao adicionar ao turno',
      onSuccess: refresh,
    }),
  );
  const removeMutation = api.shift.setEmployeeShift.useMutation(
    mutationFeedback({
      success: 'Funcionário removido do turno!',
      error: 'Erro ao remover do turno',
      onSuccess: refresh,
    }),
  );

  return (
    <EmployeesDialog
      open={!!shift}
      onOpenChange={onOpenChange}
      title={shift?.name ?? 'Turno'}
      description={
        shift && (
          <>
            {formatShiftTime(shift)} · {members.length}{' '}
            {members.length === 1 ? 'funcionário' : 'funcionários'}
          </>
        )
      }
      members={members}
      isLoading={isLoading}
      candidates={canAssign ? candidates : undefined}
      onAdd={
        shift
          ? (employeeId) =>
              addMutation.mutate({ employeeId, shiftId: shift.id })
          : undefined
      }
      onRemove={
        canAssign
          ? (employeeId) => removeMutation.mutate({ employeeId, shiftId: null })
          : undefined
      }
      removeLabel="Remover do turno"
      busy={addMutation.isPending || removeMutation.isPending}
      canOpenEmployee={canOpenEmployee}
      listHref={shift ? `/employees?turno=${shift.id}` : undefined}
      emptyText="Nenhum funcionário neste turno."
    />
  );
}
