import { useState } from 'react';
import { type RouterOutputs } from '@/trpc/react';
import { User, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmployeeStatusBadge } from './employee-status-badge';
import { DeleteEmployeeDialog } from './employee-delete-dialog';

type Employee = RouterOutputs['employees']['getAll'][number];

interface EmployeeCardProps {
  employee: Employee;
  onSelectEmployee?: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onSelectEmployee }: EmployeeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <>
      <Card 
        className="mb-3 cursor-pointer hover:bg-muted/10 transition-colors relative group"
        onClick={() => onSelectEmployee?.(employee)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-4" />
              </div>
              <div>
                <p className="font-semibold">{employee.name}</p>
                <p className="text-xs text-muted-foreground">{employee.sector || '—'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <EmployeeStatusBadge status={employee.status} />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteEmployeeDialog
        employeeId={isDeleting ? employee.id : null}
        employeeName={employee.name}
        open={isDeleting}
        onOpenChange={setIsDeleting}
      />
    </>
  );
}