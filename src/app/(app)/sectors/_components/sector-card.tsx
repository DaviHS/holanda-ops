'use client';

import { Building2, Users } from 'lucide-react';
import { type RouterOutputs } from '@/trpc/react';
import { EntityCard } from '@/components/entity-card';
import { RowActions } from '@/components/row-actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

type Sector = RouterOutputs['sector']['list'][number];

interface SectorCardProps {
  sector: Sector;
  onEdit?: (sector: Sector) => void;
  onDelete?: (sector: Sector) => void;
  /** Abre a janela com os funcionários do setor. */
  onViewEmployees?: (sector: Sector) => void;
}

export function SectorCard({
  sector,
  onEdit,
  onDelete,
  onViewEmployees,
}: SectorCardProps) {
  const canView = !!onViewEmployees && sector.employeeCount > 0;

  return (
    <EntityCard
      icon={Building2}
      title={sector.name}
      subtitle={`${sector.employeeCount} func.`}
      onOpen={onEdit && (() => onEdit(sector))}
      actions={
        <RowActions
          compact
          label={sector.name}
          onEdit={onEdit && (() => onEdit(sector))}
          onDelete={onDelete && (() => onDelete(sector))}
        >
          {canView && (
            <DropdownMenuItem onClick={() => onViewEmployees(sector)}>
              <Users className="mr-2 size-4" /> Funcionários
            </DropdownMenuItem>
          )}
        </RowActions>
      }
    >
      {sector.description && (
        <p className="text-muted-foreground line-clamp-2 text-xs break-words">
          {sector.description}
        </p>
      )}
    </EntityCard>
  );
}
