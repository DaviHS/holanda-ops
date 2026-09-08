'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type Shift = RouterOutputs['shifts']['getAll'][number];

interface ShiftCardProps {
  shift: Shift;
  onSelectShift?: (shift: Shift) => void;
}

export function ShiftCard({ shift, onSelectShift }: ShiftCardProps) {
  return (
    <Card 
      className="mb-3 cursor-pointer hover:bg-muted/10 transition-colors"
      onClick={() => onSelectShift?.(shift)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{shift.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {shift.startTime} – {shift.endTime}
              </p>
              {shift.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {shift.description}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}