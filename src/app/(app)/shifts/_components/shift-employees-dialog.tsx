'use client';

import Link from 'next/link';
import { User, Users } from 'lucide-react';
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
import { formatShiftTime } from '@/lib/formatters';
import { EmployeeStatusBadge } from '@/app/(app)/employees/_components/employee-status-badge';

type Shift = RouterOutputs['shift']['list'][number];

interface ShiftEmployeesDialogProps {
  shift: Shift | null;
  onOpenChange: (open: boolean) => void;
}

/** Janela com os funcionários de um turno (leitura). */
export function ShiftEmployeesDialog({
  shift,
  onOpenChange,
}: ShiftEmployeesDialogProps) {
  const { data: employees = [], isLoading } = api.employee.list.useQuery(
    undefined,
    { enabled: !!shift },
  );
  const members = shift
    ? employees.filter((employee) => employee.shiftId === shift.id)
    : [];

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
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {employee.name.trim()}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {employee.sector || '—'}
                    </p>
                  </div>
                </div>
                <EmployeeStatusBadge status={employee.status} />
              </div>
            ))
          )}
        </div>

        <DialogFooter className="bg-muted/20 shrink-0 border-t px-6 py-3">
          {shift && members.length > 0 && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/employees?turno=${shift.id}`} />}
            >
              Abrir na lista
            </Button>
          )}
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
