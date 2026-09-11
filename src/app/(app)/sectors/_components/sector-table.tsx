'use client';

import { useState } from 'react';
import { type RouterOutputs } from '@/trpc/react';
import { Building2, MoreHorizontal, Trash2, Eye } from 'lucide-react';
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
import { DeleteSectorDialog } from './sector-delete-dialog';

type Sector = RouterOutputs['sectors']['getAll'][number];

interface SectorTableProps {
  sectors: Sector[];
  onSelectSector: (sector: Sector) => void;
}

export function SectorTable({ sectors, onSelectSector }: SectorTableProps) {
  const [selectedToDelete, setSelectedToDelete] = useState<Sector | null>(null);

  return (
    <>
      <Card className="rounded-md overflow-hidden">
        <ScrollArea className="w-full">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
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
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Building2 className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{sector.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sector.description || '—'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Abrir menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSelectSector(sector)}>
                            <Eye className="mr-2 size-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setSelectedToDelete(sector)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      <DeleteSectorDialog
        sectorId={selectedToDelete?.id ?? null}
        sectorName={selectedToDelete?.name}
        open={!!selectedToDelete}
        onOpenChange={(open) => !open && setSelectedToDelete(null)}
      />
    </>
  );
}