'use client';

import { type RouterOutputs } from '@/trpc/react';
import { ShieldCheck } from 'lucide-react';
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

type Role = RouterOutputs['role']['list'][number];

interface RoleTableProps {
  roles: Role[];
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export function RoleTable({ roles, onEdit, onDelete }: RoleTableProps) {
  return (
    <Card className="overflow-hidden rounded-md">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cargo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className={ACTIONS_CELL_CLASS}>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow
                key={role.id}
                {...editableRowProps(onEdit && (() => onEdit(role)))}
                className="hover:bg-muted/20 cursor-pointer transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                      <ShieldCheck className="size-4" />
                    </div>
                    <p className="font-semibold">{role.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {orDash(role.description)}
                </TableCell>
                <TableCell className={ACTIONS_CELL_CLASS}>
                  <RowActions
                    label={role.name}
                    onEdit={onEdit && (() => onEdit(role))}
                    onDelete={onDelete && (() => onDelete(role))}
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
