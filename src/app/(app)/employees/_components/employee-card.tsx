'use client';

import { User } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import { EntityCard } from '@/components/entity-card';
import { RowActions } from '@/components/row-actions';
import { EmployeeStatusBadge } from './employee-status-badge';

type Employee = RouterOutputs['employee']['list'][number];

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export function EmployeeCard({
  employee,
  onEdit,
  onDelete,
}: EmployeeCardProps) {
  const subtitle = [employee.sector, employee.shift?.name]
    .filter(Boolean)
    .join(' · ');

  return (
    <EntityCard
      icon={User}
      title={employee.name.trim()}
      subtitle={subtitle || '—'}
      onOpen={onEdit && (() => onEdit(employee))}
      actions={
        <>
          <EmployeeStatusBadge status={employee.status} />
          <RowActions
            compact
            label={employee.name}
            onEdit={onEdit && (() => onEdit(employee))}
            onDelete={onDelete && (() => onDelete(employee))}
          />
        </>
      }
    />
  );
}
