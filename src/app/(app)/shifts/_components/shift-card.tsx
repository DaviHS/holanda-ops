'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Clock, ChevronRight, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Shift = RouterOutputs['shift']['list'][number];

interface ShiftCardProps {
  shift: Shift;
  onEdit?: (shift: Shift) => void;
  onDelete?: (shift: Shift) => void;
}

export function ShiftCard({ shift, onEdit, onDelete }: ShiftCardProps) {

  return (
    <>
      <Card 
        className="mb-3 cursor-pointer hover:bg-muted/10 transition-colors relative group"
        onClick={() => onEdit?.(shift)}
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
              {onDelete && (
                <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(shift)}
              >
                <Trash2 className="size-4" />
              </Button>
              )}
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}