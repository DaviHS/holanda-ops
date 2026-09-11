'use client';

import { useState } from 'react';
import { type RouterOutputs } from '@/trpc/react';
import { Clock, ChevronRight, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteShiftDialog } from './shift-delete-dialog';

type Shift = RouterOutputs['shifts']['getAll'][number];

interface ShiftCardProps {
  shift: Shift;
  onSelectShift?: (shift: Shift) => void;
}

export function ShiftCard({ shift, onSelectShift }: ShiftCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <>
      <Card 
        className="mb-3 cursor-pointer hover:bg-muted/10 transition-colors relative group"
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
            
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="size-4" />
              </Button>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteShiftDialog
        shiftId={isDeleting ? shift.id : null}
        shiftName={shift.name}
        open={isDeleting}
        onOpenChange={setIsDeleting}
      />
    </>
  );
}