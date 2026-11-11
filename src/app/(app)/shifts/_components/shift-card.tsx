'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarClock, Users } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import {
  RowActions,
  editableRowProps,
  stopRowEvent,
} from '@/components/row-actions';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { formatShiftTime } from '@/lib/formatters';

type Shift = RouterOutputs['shift']['list'][number];

interface ShiftCardProps {
  shift: Shift;
  onEdit?: (shift: Shift) => void;
  onDelete?: (shift: Shift) => void;
  employeesHref?: (shift: Shift) => string;
}

export function ShiftCard({
  shift,
  onEdit,
  onDelete,
  employeesHref,
}: ShiftCardProps) {
  const router = useRouter();
  const href = employeesHref?.(shift);
  const hasEmployees = shift.employeeCount > 0;

  return (
    <Card
      {...editableRowProps(onEdit && (() => onEdit(shift)))}
      className="hover:bg-muted/10 mb-2 cursor-pointer transition-colors"
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
              <CalendarClock className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{shift.name}</p>
              <p className="text-muted-foreground text-xs">
                <span className="font-mono">{formatShiftTime(shift)}</span>
                {' · '}
                {href && hasEmployees ? (
                  <Link
                    href={href}
                    onClick={stopRowEvent}
                    className="text-primary hover:underline"
                  >
                    {shift.employeeCount} func.
                  </Link>
                ) : (
                  `${shift.employeeCount} func.`
                )}
              </p>
            </div>
          </div>
          <div className="shrink-0" onClick={stopRowEvent}>
            <RowActions
              compact
              label={shift.name}
              onEdit={onEdit && (() => onEdit(shift))}
              onDelete={onDelete && (() => onDelete(shift))}
            >
              {href && hasEmployees && (
                <DropdownMenuItem onClick={() => router.push(href)}>
                  <Users className="mr-2 size-4" /> Ver funcionários
                </DropdownMenuItem>
              )}
            </RowActions>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
