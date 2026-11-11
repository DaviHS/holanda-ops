'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Building2, MoreHorizontal, Trash2, Eye } from 'lucide-react';
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

type Sector = RouterOutputs['sector']['list'][number];

interface SectorTableProps {
  sectors: Sector[];
  onEdit?: (sector: Sector) => void;
  onDelete?: (sector: Sector) => void;
}

export function SectorTable({ sectors, onEdit, onDelete }: SectorTableProps) {
  return (
    <>
      <Card className="overflow-hidden rounded-md">
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
                    onClick={() => onEdit?.(sector)}
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
                          <Building2 className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{sector.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {orDash(sector.description)}
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
                              <DropdownMenuItem onClick={() => onEdit(sector)}>
                                <Eye className="mr-2 size-4" /> Visualizar
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(sector)}
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
                {sectors.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground py-10 text-center"
                    >
                      Nenhum setor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </ScrollArea>
      </Card>
    </>
  );
}
