'use client';

import { Building2, CheckCircle2, Clock, User } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import { EntityCard } from '@/components/entity-card';
import { RowActions } from '@/components/row-actions';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EmployeeStatusBadge } from './employee-status-badge';

type Employee = RouterOutputs['employee']['list'][number];

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;

  onView?: (employee: Employee) => void;

  onApprove?: (employee: Employee) => void;

  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (employee: Employee, selected: boolean) => void;
}

export function EmployeeCard({
  employee,
  onEdit,
  onDelete,
  onView,
  onApprove,
  selectable = false,
  selected = false,
  onSelectedChange,
}: EmployeeCardProps) {
  const onOpen = selectable
    ? () => onSelectedChange?.(employee, !selected)
    : (onEdit ?? onView);
  const isPending = employee.status === 'pending';

  return (
    <EntityCard
      icon={User}
      imageUrl={employee.avatarUrl}
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
      className={cn(selected && 'border-primary bg-primary/5')}
      leading={
        selectable && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) =>
              onSelectedChange?.(employee, checked === true)
            }
            aria-label={`Selecionar ${employee.name.trim()}`}
          />
        )
      }
      onOpen={onOpen && (() => onOpen(employee))}
      actions={
        selectable ? undefined : (
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
        )
      }
    >
      {employee.status !== 'active' && (
        <EmployeeStatusBadge status={employee.status} />
      )}
    </EntityCard>
  );
}
