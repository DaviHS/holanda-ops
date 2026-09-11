import { useState } from 'react';
import { type RouterOutputs } from '@/trpc/react';
import { User, MoreHorizontal, Trash2, Eye } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EmployeeStatusBadge } from './employee-status-badge';
import { DeleteEmployeeDialog } from './employee-delete-dialog';

type Employee = RouterOutputs['employees']['getAll'][number];

interface EmployeeTableProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
}

export function EmployeeTable({ employees, onSelectEmployee }: EmployeeTableProps) {
  const [selectedToDelete, setSelectedToDelete] = useState<Employee | null>(null);

  return (
    <>
      <Card className="rounded-md overflow-hidden">
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
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{emp.cpf}</TableCell>
                    <TableCell className="hidden font-mono text-xs md:table-cell">{emp.rg || '—'}</TableCell>
                    <TableCell>{emp.sector || '—'}</TableCell>
                    <TableCell>{emp.shift?.name ?? '—'}</TableCell>
                    <TableCell className="text-xs font-mono">
                      {emp.shift?.startTime && emp.shift?.endTime ? `${emp.shift.startTime} – ${emp.shift.endTime}` : '—'}
                    </TableCell>
                    <TableCell>
                      <EmployeeStatusBadge status={emp.status} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Abrir menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSelectEmployee(emp)}>
                            <Eye className="mr-2 size-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setSelectedToDelete(emp)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </ScrollArea>
      </Card>

      <DeleteEmployeeDialog
        employeeId={selectedToDelete?.id ?? null}
        employeeName={selectedToDelete?.name}
        open={!!selectedToDelete}
        onOpenChange={(open) => !open && setSelectedToDelete(null)}
      />
    </>
  );
}