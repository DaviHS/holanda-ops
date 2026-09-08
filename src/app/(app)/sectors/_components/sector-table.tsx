'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Building2 } from 'lucide-react';
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

type Sector = RouterOutputs['sectors']['getAll'][number];

interface SectorTableProps {
  sectors: Sector[];
  onSelectSector: (sector: Sector) => void;
}

export function SectorTable({ sectors, onSelectSector }: SectorTableProps) {
  return (
    <Card className="rounded-md overflow-hidden">
      <ScrollArea className="w-full">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="hidden md:table-cell">Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectors.map((sector) => (
                <TableRow
                  key={sector.id}
                  onClick={() => onSelectSector(sector)}
                  className="cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <Building2 className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold">{sector.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {sector.description || '—'}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {sector.createdAt
                      ? new Date(sector.createdAt).toLocaleDateString('pt-BR')
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
              {sectors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    Nenhum setor encontrado.
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