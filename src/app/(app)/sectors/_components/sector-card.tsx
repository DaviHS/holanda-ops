'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Building2, ChevronRight, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Sector = RouterOutputs['sector']['list'][number];

interface SectorCardProps {
  sector: Sector;
  onEdit?: (sector: Sector) => void;
  onDelete?: (sector: Sector) => void;
}

export function SectorCard({ sector, onEdit, onDelete }: SectorCardProps) {
  return (
    <>
      <Card
        className="hover:bg-muted/10 group relative mb-3 cursor-pointer transition-colors"
        onClick={() => onEdit?.(sector)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                <Building2 className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{sector.name}</p>
                {sector.description && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                    {sector.description}
                  </p>
                )}
              </div>
            </div>

            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive size-8"
                  onClick={() => onDelete(sector)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
              <ChevronRight className="text-muted-foreground size-4 shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
