import { type RouterOutputs } from '@/trpc/react';
import { User, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { orDash } from '@/lib/formatters';
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
import { EmployeeStatusBadge } from './employee-status-badge';

type Employee = RouterOutputs['employee']['list'][number];

interface EmployeeTableProps {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  return (
    <>
      <Card className="overflow-hidden rounded-md">
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
                    onClick={() => onEdit?.(emp)}
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
                          <User className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{emp.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {emp.cpf}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs md:table-cell">
                      {orDash(emp.rg)}
                    </TableCell>
                    <TableCell>{orDash(emp.sector)}</TableCell>
                    <TableCell>{emp.shift?.name ?? '—'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {emp.shift?.startTime && emp.shift?.endTime
                        ? `${emp.shift.startTime} – ${emp.shift.endTime}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <EmployeeStatusBadge status={emp.status} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {(onEdit ?? onDelete) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Abrir menu</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(emp)}>
                                <Eye className="mr-2 size-4" /> Visualizar
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(emp)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" /> Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </ScrollArea>
      </Card>
    </>
  );
}
