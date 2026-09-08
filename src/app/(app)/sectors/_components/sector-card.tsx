'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Building2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type Sector = RouterOutputs['sectors']['getAll'][number];

interface SectorCardProps {
  sector: Sector;
  onSelectSector?: (sector: Sector) => void;
}

export function SectorCard({ sector, onSelectSector }: SectorCardProps) {
  return (
    <Card 
      className="mb-3 cursor-pointer hover:bg-muted/10 transition-colors"
      onClick={() => onSelectSector?.(sector)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{sector.name}</p>
              {sector.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {sector.description}
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