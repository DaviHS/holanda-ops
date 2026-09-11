'use client';

import { useState } from 'react';
import { type RouterOutputs } from '@/trpc/react';
import { UserCheck, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
import { DeleteUserDialog } from './user-delete-dialog';

type User = RouterOutputs['users']['getAll'][number];

interface UserTableProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

export function UserTable({ users, onSelectUser }: UserTableProps) {
  const [selectedToDelete, setSelectedToDelete] = useState<User | null>(null);

  return (
    <>
      <Card className="rounded-md overflow-hidden">
        <ScrollArea className="w-full">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Funcionário Vinculado</TableHead>
                  <TableHead>Perfil / Nível</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const displayName = user.employee?.name ?? user.email.split('@')[0];
                  const avatarInitials = displayName.substring(0, 2).toUpperCase();

                  return (
                    <TableRow
                      key={user.id}
                      onClick={() => onSelectUser(user)}
                      className="cursor-pointer hover:bg-muted/20 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {avatarInitials}
                          </div>
                          <div>
                            <p className="font-semibold">{displayName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{user.email}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.employee?.name ? (
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <UserCheck className="size-3.5 text-emerald-500" />
                            {user.employee.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">— Sem Vínculo —</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role?.name?.toLowerCase() === 'admin' ? 'default' : 'secondary'}
                          className="rounded-md"
                        >
                          {user.role?.name ?? 'Sem Perfil'}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Abrir menu</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onSelectUser(user)}>
                              <Eye className="mr-2 size-4" /> Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSelectedToDelete(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 size-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </ScrollArea>
      </Card>

      <DeleteUserDialog
        userId={selectedToDelete?.id ?? null}
        userName={selectedToDelete?.employee?.name ?? selectedToDelete?.email}
        open={!!selectedToDelete}
        onOpenChange={(open) => !open && setSelectedToDelete(null)}
      />
    </>
  );
}