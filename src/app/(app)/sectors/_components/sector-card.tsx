'use client';

import { Building2 } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import { EntityCard } from '@/components/entity-card';
import { RowActions } from '@/components/row-actions';

type Sector = RouterOutputs['sector']['list'][number];

interface SectorCardProps {
  sector: Sector;
  onEdit?: (sector: Sector) => void;
  onDelete?: (sector: Sector) => void;
}

export function SectorCard({ sector, onEdit, onDelete }: SectorCardProps) {
  return (
    <EntityCard
      icon={Building2}
      title={sector.name}
      subtitle={sector.description}
      onOpen={onEdit && (() => onEdit(sector))}
      actions={
        <RowActions
          compact
          label={sector.name}
          onEdit={onEdit && (() => onEdit(sector))}
          onDelete={onDelete && (() => onDelete(sector))}
        />
      }
    />
  );
}
