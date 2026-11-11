'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarClock, Users } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import { formatShiftTime, orDash } from '@/lib/formatters';
import {
  ACTIONS_CELL_CLASS,
  RowActions,
  editableRowProps,
} from '@/components/row-actions';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Shift = RouterOutputs['shift']['list'][number];

interface ShiftTableProps {
  shifts: Shift[];
  onEdit?: (shift: Shift) => void;
  onDelete?: (shift: Shift) => void;
  /** Link para os funcionários do turno (só para quem pode ver funcionários). */
  employeesHref?: (shift: Shift) => string;
}

export function ShiftTable({
  shifts,
  onEdit,
  onDelete,
  employeesHref,
}: ShiftTableProps) {
  const router = useRouter();

  return (
    <Card className="overflow-hidden rounded-md">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Turno</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Funcionários</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className={ACTIONS_CELL_CLASS}>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => {
              const href = employeesHref?.(shift);
              const hasEmployees = shift.employeeCount > 0;
              return (
                <TableRow
                  key={shift.id}
                  {...editableRowProps(onEdit && (() => onEdit(shift)))}
                  className="hover:bg-muted/20 cursor-pointer transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                        <CalendarClock className="size-4" />
                      </div>
                      <p className="font-semibold">{shift.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatShiftTime(shift)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {href && hasEmployees ? (
                      <Link
                        href={href}
                        onClick={(event) => event.stopPropagation()}
                        className="text-primary font-medium hover:underline"
                        title="Ver funcionários do turno"
                      >
                        {shift.employeeCount}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">
                        {shift.employeeCount}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {orDash(shift.description)}
                  </TableCell>
                  <TableCell className={ACTIONS_CELL_CLASS}>
                    <RowActions
                      label={shift.name}
                      onEdit={onEdit && (() => onEdit(shift))}
                      onDelete={onDelete && (() => onDelete(shift))}
                    >
                      {href && hasEmployees && (
                        <DropdownMenuItem onClick={() => router.push(href)}>
                          <Users className="mr-2 size-4" /> Ver funcionários
                        </DropdownMenuItem>
                      )}
                    </RowActions>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
