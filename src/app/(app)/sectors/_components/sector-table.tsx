'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Building2 } from 'lucide-react';
import { orDash } from '@/lib/formatters';
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

type Sector = RouterOutputs['sector']['list'][number];

interface SectorTableProps {
  sectors: Sector[];
  onEdit?: (sector: Sector) => void;
  onDelete?: (sector: Sector) => void;
}

export function SectorTable({ sectors, onEdit, onDelete }: SectorTableProps) {
  return (
    <Card className="overflow-hidden rounded-md">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className={ACTIONS_CELL_CLASS}>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectors.map((sector) => (
              <TableRow
                key={sector.id}
                {...editableRowProps(onEdit && (() => onEdit(sector)))}
                className="hover:bg-muted/20 cursor-pointer transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                      <Building2 className="size-4" />
                    </div>
                    <p className="font-semibold">{sector.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {orDash(sector.description)}
                </TableCell>
                <TableCell className={ACTIONS_CELL_CLASS}>
                  <RowActions
                    label={sector.name}
                    onEdit={onEdit && (() => onEdit(sector))}
                    onDelete={onDelete && (() => onDelete(sector))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
