'use client';

import { type RouterOutputs } from '@/trpc/react';
import { Building2 } from 'lucide-react';
import {
  RowActions,
  editableRowProps,
  stopRowEvent,
} from '@/components/row-actions';
import { Card, CardContent } from '@/components/ui/card';

type Sector = RouterOutputs['sector']['list'][number];

interface SectorCardProps {
  sector: Sector;
  onEdit?: (sector: Sector) => void;
  onDelete?: (sector: Sector) => void;
}

export function SectorCard({ sector, onEdit, onDelete }: SectorCardProps) {
  return (
    <Card
      {...editableRowProps(onEdit && (() => onEdit(sector)))}
      className="hover:bg-muted/10 mb-2 cursor-pointer transition-colors"
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
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
          <div className="shrink-0" onClick={stopRowEvent}>
            <RowActions
              compact
              label={sector.name}
              onEdit={onEdit && (() => onEdit(sector))}
              onDelete={onDelete && (() => onDelete(sector))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
