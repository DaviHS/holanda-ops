import { type RouterOutputs } from '@/trpc/react';
import { User } from 'lucide-react';
import {
  RowActions,
  editableRowProps,
  stopRowEvent,
} from '@/components/row-actions';
import { Card, CardContent } from '@/components/ui/card';
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
  return (
    <Card
      {...editableRowProps(onEdit && (() => onEdit(employee)))}
      className="hover:bg-muted/10 mb-2 cursor-pointer transition-colors"
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
              <User className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{employee.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {employee.sector || '—'}
              </p>
            </div>
          </div>

          <div
            className="flex shrink-0 items-center gap-1"
            onClick={stopRowEvent}
          >
            <EmployeeStatusBadge status={employee.status} />
            <RowActions
              compact
              label={employee.name}
              onEdit={onEdit && (() => onEdit(employee))}
              onDelete={onDelete && (() => onDelete(employee))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
