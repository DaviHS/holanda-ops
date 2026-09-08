import { type RouterOutputs } from '@/trpc/react';
import { ShieldCheck } from 'lucide-react';
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

type Role = RouterOutputs['roles']['getAll'][number];

interface RoleTableProps {
  roles: Role[];
  onSelectRole: (role: Role) => void;
}

export function RoleTable({ roles, onSelectRole }: RoleTableProps) {
  return (
    <Card className="rounded-md overflow-hidden">
      <ScrollArea className="w-full">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead>Descrição</TableHead>
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
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                    Nenhum cargo encontrado.
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