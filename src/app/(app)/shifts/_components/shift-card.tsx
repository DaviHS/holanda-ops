'use client';

import { CalendarClock, Moon, Users } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import { EntityCard } from '@/components/entity-card';
import { RowActions } from '@/components/row-actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import {
  formatShiftDuration,
  formatShiftTime,
  isOvernightShift,
} from '@/lib/formatters';

type Shift = RouterOutputs['shift']['list'][number];

interface ShiftCardProps {
  shift: Shift;
  onEdit?: (shift: Shift) => void;
  onDelete?: (shift: Shift) => void;
  onViewEmployees?: (shift: Shift) => void;
}

export function ShiftCard({
  shift,
  onEdit,
  onDelete,
  onViewEmployees,
}: ShiftCardProps) {
  const canView = !!onViewEmployees && shift.employeeCount > 0;

  return (
    <EntityCard
      icon={CalendarClock}
      title={shift.name}
      subtitle={
        <>
          <span className="font-mono">{formatShiftTime(shift)}</span>
          {formatShiftDuration(shift) && ` · ${formatShiftDuration(shift)}`}
          {isOvernightShift(shift) && (
            <Moon
              className="mb-0.5 ml-1 inline size-3"
              aria-label="Vira a noite"
            />
          )}
          {` · ${shift.employeeCount} func.`}
        </>
      }
      onOpen={onEdit && (() => onEdit(shift))}
      actions={
        <RowActions
          compact
          label={shift.name}
          onEdit={onEdit && (() => onEdit(shift))}
          onDelete={onDelete && (() => onDelete(shift))}
        >
          {canView && (
            <DropdownMenuItem onClick={() => onViewEmployees(shift)}>
              <Users className="mr-2 size-4" /> Funcionários
            </DropdownMenuItem>
          )}
        </RowActions>
      }
    >
      {shift.description && (
        <p className="text-muted-foreground line-clamp-2 text-xs break-words">
          {shift.description}
        </p>
      )}
    </EntityCard>
  );
}
