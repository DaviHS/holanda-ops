'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, UserMinus, Users } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingState } from '@/components/ui/loading-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatShiftTime } from '@/lib/formatters';
import { mutationFeedback } from '@/lib/mutation-feedback';
import { EmployeeStatusBadge } from '@/app/(app)/employees/_components/employee-status-badge';

type Shift = RouterOutputs['shift']['list'][number];

interface ShiftEmployeesDialogProps {
  shift: Shift | null;
  onOpenChange: (open: boolean) => void;
  /** Pode colocar e tirar funcionários deste turno. */
  canAssign?: boolean;
  /** Pode abrir a edição de um funcionário. */
  canOpenEmployee?: boolean;
}

/** Janela com os funcionários de um turno: ver, adicionar, remover e abrir o cadastro. */
export function ShiftEmployeesDialog({
  shift,
  onOpenChange,
  canAssign = false,
  canOpenEmployee = false,
}: ShiftEmployeesDialogProps) {
  const router = useRouter();
  const utils = api.useUtils();

  // Só os funcionários deste turno (o filtro é feito no servidor).
  const { data: members = [], isLoading } = api.employee.list.useQuery(
    { shiftId: shift?.id },
    { enabled: !!shift },
  );
  // Candidatos a entrar no turno: só carrega para quem pode adicionar.
  const { data: everyone = [] } = api.employee.list.useQuery(undefined, {
    enabled: !!shift && canAssign,
  });
  const candidates = shift
    ? everyone.filter((employee) => employee.shiftId !== shift.id)
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

  const busy = addMutation.isPending || removeMutation.isPending;

  return (
    <Dialog open={!!shift} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-[460px]">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex min-w-0 items-center gap-2 text-lg font-semibold">
            <Users className="text-muted-foreground size-5 shrink-0" />
            <span className="truncate">{shift?.name ?? 'Turno'}</span>
          </DialogTitle>
          {shift && (
            <DialogDescription className="truncate">
              {formatShiftTime(shift)} · {members.length}{' '}
              {members.length === 1 ? 'funcionário' : 'funcionários'}
            </DialogDescription>
          )}
        </DialogHeader>

        {canAssign && shift && (
          <div className="shrink-0 border-b px-4 py-3">
            <Select
              value={null}
              disabled={busy || candidates.length === 0}
              onValueChange={(employeeId) => {
                if (employeeId)
                  addMutation.mutate({ employeeId, shiftId: shift.id });
              }}
            >
              <SelectTrigger
                className="w-full"
                aria-label="Adicionar funcionário"
              >
                <SelectValue
                  placeholder={
                    candidates.length === 0
                      ? 'Todos já estão neste turno'
                      : 'Adicionar funcionário...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name.trim()}
                    {employee.shift ? ` · ${employee.shift.name}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="min-h-24 flex-1 space-y-2 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <LoadingState />
          ) : members.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Nenhum funcionário neste turno.
            </p>
          ) : (
            members.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <button
                  type="button"
                  disabled={!canOpenEmployee}
                  onClick={() =>
                    router.push(`/employees?editar=${employee.id}`)
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 text-left enabled:hover:opacity-80"
                  title={canOpenEmployee ? 'Abrir cadastro' : undefined}
                >
                  <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                    <User className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {employee.name.trim()}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {employee.sector || '—'}
                    </span>
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <EmployeeStatusBadge status={employee.status} />
                  {canAssign && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive size-8"
                      aria-label={`Remover ${employee.name.trim()} do turno`}
                      title="Remover do turno"
                      disabled={busy}
                      onClick={() =>
                        removeMutation.mutate({
                          employeeId: employee.id,
                          shiftId: null,
                        })
                      }
                    >
                      <UserMinus className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="bg-muted/20 shrink-0 border-t px-6 py-3">
          {shift && members.length > 0 && (
            <Button
              variant="outline"
              className="flex-1"
              nativeButton={false}
              render={<Link href={`/employees?turno=${shift.id}`} />}
            >
              Abrir na lista
            </Button>
          )}
          <Button
            type="button"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
