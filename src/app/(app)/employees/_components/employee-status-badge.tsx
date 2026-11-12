import { Badge } from '@/components/ui/badge';
import { EMPLOYEE_STATUS, type EmployeeStatus } from '@/lib/employee-status';
import { cn } from '@/lib/utils';

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const info = EMPLOYEE_STATUS[status];
  return (
    <Badge
      title={info.hint}
      className={cn('border-transparent', info.className)}
    >
      {info.label}
    </Badge>
  );
}
