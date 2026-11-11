import { type RouterOutputs } from '@/trpc/react';
import { User, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <>
      <Card
        className="hover:bg-muted/10 group relative mb-3 cursor-pointer transition-colors"
        onClick={() => onEdit?.(employee)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
                <User className="size-4" />
              </div>
              <div>
                <p className="font-semibold">{employee.name}</p>
                <p className="text-muted-foreground text-xs">
                  {employee.sector || '—'}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <EmployeeStatusBadge status={employee.status} />
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive size-8"
                  onClick={() => onDelete(employee)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
