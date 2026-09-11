'use client';

import { useState } from 'react';
import { type RouterOutputs } from '@/trpc/react';
import { Clock, MoreHorizontal, Trash2, Eye } from 'lucide-react';
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
import { DeleteShiftDialog } from './shift-delete-dialog';

type Shift = RouterOutputs['shifts']['getAll'][number];

interface ShiftTableProps {
  shifts: Shift[];
  onSelectShift: (shift: Shift) => void;
}

export function ShiftTable({ shifts, onSelectShift }: ShiftTableProps) {
  const [selectedToDelete, setSelectedToDelete] = useState<Shift | null>(null);

  return (
    <>
      <Card className="rounded-md overflow-hidden">
        <ScrollArea className="w-full">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turno</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow
                    key={shift.id}
                    onClick={() => onSelectShift(shift)}
                    className="cursor-pointer hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Clock className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{shift.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {shift.startTime} – {shift.endTime}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {shift.description || '—'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Abrir menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSelectShift(shift)}>
                            <Eye className="mr-2 size-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setSelectedToDelete(shift)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {shifts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Nenhum turno encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </ScrollArea>
      </Card>

      <DeleteShiftDialog
        shiftId={selectedToDelete?.id ?? null}
        shiftName={selectedToDelete?.name}
        open={!!selectedToDelete}
        onOpenChange={(open) => !open && setSelectedToDelete(null)}
      />
    </>
  );
}