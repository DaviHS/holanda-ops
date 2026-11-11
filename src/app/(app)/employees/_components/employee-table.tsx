import { type RouterOutputs } from '@/trpc/react';
import { User } from 'lucide-react';
import { formatShiftTime, orDash } from '@/lib/formatters';
import {
  RowActions,
  editableRowProps,
  ACTIONS_CELL_CLASS,
} from '@/components/row-actions';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
                <TableHead className={ACTIONS_CELL_CLASS}>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow
                  key={emp.id}
                  {...editableRowProps(onEdit && (() => onEdit(emp)))}
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
                  <TableCell className="font-mono text-xs">{emp.cpf}</TableCell>
                  <TableCell className="hidden font-mono text-xs md:table-cell">
                    {orDash(emp.rg)}
                  </TableCell>
                  <TableCell>{orDash(emp.sector)}</TableCell>
                  <TableCell>{emp.shift?.name ?? '—'}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatShiftTime(emp.shift)}
                  </TableCell>
                  <TableCell>
                    <EmployeeStatusBadge status={emp.status} />
                  </TableCell>
                  <TableCell className={ACTIONS_CELL_CLASS}>
                    <RowActions
                      label={emp.name}
                      onEdit={onEdit && (() => onEdit(emp))}
                      onDelete={onDelete && (() => onDelete(emp))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
