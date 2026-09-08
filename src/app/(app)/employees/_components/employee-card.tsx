import { type RouterOutputs } from '@/trpc/react';
import { ChevronRight, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { EmployeeStatusBadge } from './employee-status-badge';

type Employee = RouterOutputs['employees']['getAll'][number];

interface EmployeeCardProps {
  employee: Employee;
  onSelectEmployee?: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onSelectEmployee }: EmployeeCardProps) {
  return (
    <Card 
      className="mb-3 cursor-pointer hover:bg-muted/10 transition-colors"
      onClick={() => onSelectEmployee?.(employee)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="size-4" />
            </div>
            <div>
              <p className="font-semibold">{employee.name}</p>
              <p className="text-xs text-muted-foreground">{employee.sector}</p>
            </div>
          </div>
          <EmployeeStatusBadge status={employee.status} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
          <div>
            <span className="text-muted-foreground">CPF</span>
            <p className="font-mono">{employee.cpf}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Turno</span>
            <p>{employee.shift === 'night' ? 'Noturno' : 'Diurno'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Horário</span>
            <p>{employee.entryTime} – {employee.exitTime}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Uniforme</span>
            <div className="mt-1 flex gap-1">
              <span className={cn('size-2.5 rounded-full', employee.uniform.shirt ? 'bg-emerald-500' : 'bg-rose-400')} title="Camisa" />
              <span className={cn('size-2.5 rounded-full', employee.uniform.pants ? 'bg-emerald-500' : 'bg-rose-400')} title="Calça" />
              <span className={cn('size-2.5 rounded-full', employee.uniform.shoes ? 'bg-emerald-500' : 'bg-rose-400')} title="Calçado" />
              {employee.uniform.jacket !== undefined && (
                <span className={cn('size-2.5 rounded-full', employee.uniform.jacket ? 'bg-emerald-500' : 'bg-rose-400')} title="Jaqueta" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex gap-3">
            <span>Camisa: {employee.shirtSize}</span>
            <span>Calça: {employee.pantsSize || '—'}</span>
            <span>Calçado: {employee.shoeSize || '—'}</span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}