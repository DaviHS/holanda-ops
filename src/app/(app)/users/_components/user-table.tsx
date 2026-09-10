import { type RouterOutputs } from '@/trpc/react';
import { UserCheck } from 'lucide-react';
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

type User = RouterOutputs['users']['getAll'][number];

interface UserTableProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

export function UserTable({ users, onSelectUser }: UserTableProps) {
  return (
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
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
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