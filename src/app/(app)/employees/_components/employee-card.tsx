'use client';

import { Building2, CheckCircle2, Clock, User } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import { EntityCard } from '@/components/entity-card';
import { RowActions } from '@/components/row-actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EmployeeStatusBadge } from './employee-status-badge';

type Employee = RouterOutputs['employee']['list'][number];

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  /** Abre os dados só para consulta (quem não pode editar). */
  onView?: (employee: Employee) => void;
  /** Aprova um pré-cadastro (passa o status para ativo). */
  onApprove?: (employee: Employee) => void;
}

export function EmployeeCard({
  employee,
  onEdit,
  onDelete,
  onView,
  onApprove,
}: EmployeeCardProps) {
  const onOpen = onEdit ?? onView;
  const isPending = employee.status === 'pending';

  return (
    <EntityCard
      icon={User}
      title={employee.name.trim()}
      subtitle={
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="inline-flex min-w-0 items-center gap-1"
            title="Setores"
          >
            <Building2 className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{employee.sector || 'Sem setor'}</span>
          </span>
          <span
            className="inline-flex shrink-0 items-center gap-1"
            title="Turno"
          >
            <Clock className="size-3 shrink-0" aria-hidden />
            <span>{employee.shift?.name ?? '—'}</span>
          </span>
        </span>
      }
      onOpen={onOpen && (() => onOpen(employee))}
      actions={
        <RowActions
          compact
          label={employee.name}
          onEdit={onEdit && (() => onEdit(employee))}
          onDelete={onDelete && (() => onDelete(employee))}
        >
          {isPending && onApprove && (
            <DropdownMenuItem onClick={() => onApprove(employee)}>
              <CheckCircle2 className="mr-2 size-4" /> Aprovar cadastro
            </DropdownMenuItem>
          )}
        </RowActions>
      }
    >
      {employee.status !== 'active' && (
        <EmployeeStatusBadge status={employee.status} />
      )}
    </EntityCard>
  );
}
