'use client';

import { type RouterOutputs } from '@/trpc/react';
import { ShieldCheck, MoreHorizontal, Trash2, Eye } from 'lucide-react';
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

type Role = RouterOutputs['role']['list'][number];

interface RoleTableProps {
  roles: Role[];
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export function RoleTable({ roles, onEdit, onDelete }: RoleTableProps) {
  return (
    <>
      <Card className="overflow-hidden rounded-md">
        <ScrollArea className="w-full">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow
                    key={role.id}
                    onClick={() => onEdit?.(role)}
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
                          <ShieldCheck className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{role.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {orDash(role.description)}
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
                              <DropdownMenuItem onClick={() => onEdit(role)}>
                                <Eye className="mr-2 size-4" /> Visualizar
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(role)}
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
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground py-10 text-center"
                    >
                      Nenhum cargo encontrado.
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
