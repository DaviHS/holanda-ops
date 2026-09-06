import { type RouterOutputs } from '@/trpc/react';
import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { EmployeeStatusBadge } from './employee-status-badge';

type Employee = RouterOutputs['employees']['getAll'][number];

interface EmployeeTableProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
}

export function EmployeeTable({ employees, onSelectEmployee }: EmployeeTableProps) {
  return (
    <Card>
      <ScrollArea className="w-full">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead className="hidden md:table-cell">RG</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Uniforme</TableHead>
                <TableHead className="hidden lg:table-cell">Camisa</TableHead>
                <TableHead className="hidden lg:table-cell">Calça</TableHead>
                <TableHead className="hidden lg:table-cell">Calçado</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp)}
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold">{emp.name}</p>
                        {emp.pixKey && (
                          <p className="text-[11px] text-muted-foreground">
                            Pix: {emp.pixKey}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{emp.cpf}</TableCell>
                  <TableCell className="hidden font-mono text-xs md:table-cell">{emp.rg || '—'}</TableCell>
                  <TableCell>{emp.sector}</TableCell>
                  <TableCell>{emp.shift === 'night' ? 'Noturno' : 'Diurno'}</TableCell>
                  <TableCell className="text-xs">
                    {emp.entryTime} – {emp.exitTime}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <span className={cn('size-3 rounded-full', emp.uniform.shirt ? 'bg-emerald-500' : 'bg-rose-400')} title="Camisa" />
                      <span className={cn('size-3 rounded-full', emp.uniform.pants ? 'bg-emerald-500' : 'bg-rose-400')} title="Calça" />
                      <span className={cn('size-3 rounded-full', emp.uniform.shoes ? 'bg-emerald-500' : 'bg-rose-400')} title="Calçado" />
                      {emp.uniform.jacket !== undefined && (
                        <span className={cn('size-3 rounded-full', emp.uniform.jacket ? 'bg-emerald-500' : 'bg-rose-400')} title="Jaqueta" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-xs lg:table-cell">{emp.shirtSize}</TableCell>
                  <TableCell className="hidden text-xs lg:table-cell">{emp.pantsSize || '—'}</TableCell>
                  <TableCell className="hidden text-xs lg:table-cell">{emp.shoeSize || '—'}</TableCell>
                  <TableCell>
                    <EmployeeStatusBadge status={emp.status} />
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                    Nenhum funcionário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}