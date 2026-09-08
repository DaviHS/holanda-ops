import { type RouterOutputs } from '@/trpc/react';
import { Clock } from 'lucide-react';
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

type Shift = RouterOutputs['shifts']['getAll'][number];

interface ShiftTableProps {
  shifts: Shift[];
  onSelectShift: (shift: Shift) => void;
}

export function ShiftTable({ shifts, onSelectShift }: ShiftTableProps) {
  return (
    <Card className="rounded-md overflow-hidden">
      <ScrollArea className="w-full">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turno</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Descrição</TableHead>
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
                  <TableCell className="text-xs">
                    {shift.startTime} – {shift.endTime}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {shift.description || '—'}
                  </TableCell>
                </TableRow>
              ))}
              {shifts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    Nenhum turno encontrado.
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