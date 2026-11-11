'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, UserMinus, Users } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
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
import { EmployeeStatusBadge } from '@/app/(app)/employees/_components/employee-status-badge';

type EmployeeRow = RouterOutputs['employee']['list'][number];

export interface EmployeeCandidate {
  id: string;
  label: string;
}

interface EmployeesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Linha abaixo do título (horário, quantidade...). */
  description?: ReactNode;
  members: EmployeeRow[];
  isLoading?: boolean;
  /** Quem pode ser adicionado. Sem esta lista não há campo de adicionar. */
  candidates?: EmployeeCandidate[];
  onAdd?: (employeeId: string) => void;
  /** Sem esta função não há botão de remover. */
  onRemove?: (employeeId: string) => void;
  removeLabel?: string;
  busy?: boolean;
  /** Pode abrir o cadastro do funcionário. */
  canOpenEmployee?: boolean;
  /** Link da lista de funcionários já filtrada. */
  listHref?: string;
  emptyText?: string;
}

/**
 * Janela padrão com os funcionários de um agrupamento (turno, setor...):
 * ver, adicionar, remover e abrir o cadastro.
 */
export function EmployeesDialog({
  open,
  onOpenChange,
  title,
  description,
  members,
  isLoading = false,
  candidates,
  onAdd,
  onRemove,
  removeLabel = 'Remover',
  busy = false,
  canOpenEmployee = false,
  listHref,
  emptyText = 'Nenhum funcionário aqui.',
}: EmployeesDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-[460px]">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex min-w-0 items-center gap-2 text-lg font-semibold">
            <Users className="text-muted-foreground size-5 shrink-0" />
            <span className="truncate">{title}</span>
          </DialogTitle>
          {description && (
            <DialogDescription className="truncate">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {candidates && onAdd && (
          <div className="shrink-0 border-b px-4 py-3">
            <Select
              value={null}
              disabled={busy || candidates.length === 0}
              onValueChange={(employeeId) => {
                if (employeeId) onAdd(employeeId);
              }}
            >
              <SelectTrigger
                className="w-full"
                aria-label="Adicionar funcionário"
              >
                <SelectValue
                  placeholder={
                    candidates.length === 0
                      ? 'Todos já estão aqui'
                      : 'Adicionar funcionário...'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.label}
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
              {emptyText}
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
                  {onRemove && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive size-8"
                      aria-label={`${removeLabel}: ${employee.name.trim()}`}
                      title={removeLabel}
                      disabled={busy}
                      onClick={() => onRemove(employee.id)}
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
          {listHref && members.length > 0 && (
            <Button
              variant="outline"
              className="flex-1"
              nativeButton={false}
              render={<Link href={listHref} />}
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
