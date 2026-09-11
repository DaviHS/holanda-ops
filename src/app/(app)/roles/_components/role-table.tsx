'use client';

import { useState } from 'react';
import { type RouterOutputs } from '@/trpc/react';
import { ShieldCheck, MoreHorizontal, Trash2, Eye } from 'lucide-react';
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
import { DeleteRoleDialog } from './role-delete-dialog';

type Role = RouterOutputs['roles']['getAll'][number];

interface RoleTableProps {
  roles: Role[];
  onSelectRole: (role: Role) => void;
}

export function RoleTable({ roles, onSelectRole }: RoleTableProps) {
  const [selectedToDelete, setSelectedToDelete] = useState<Role | null>(null);

  return (
    <>
      <Card className="rounded-md overflow-hidden">
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
                    onClick={() => onSelectRole(role)}
                    className="cursor-pointer hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ShieldCheck className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold">{role.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {role.description || '—'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Abrir menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSelectRole(role)}>
                            <Eye className="mr-2 size-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setSelectedToDelete(role)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                      Nenhum cargo encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </ScrollArea>
      </Card>

      <DeleteRoleDialog
        roleId={selectedToDelete?.id ?? null}
        roleName={selectedToDelete?.name}
        open={!!selectedToDelete}
        onOpenChange={(open) => !open && setSelectedToDelete(null)}
      />
    </>
  );
}