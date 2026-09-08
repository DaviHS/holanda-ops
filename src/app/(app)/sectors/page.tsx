'use client';

import { useState } from 'react';
import { api, type RouterOutputs } from '@/trpc/react';
import { SectorToolbar } from './_components/sector-toolbar';
import { SectorTable } from './_components/sector-table';
import { SectorCard } from './_components/sector-card';
import { SectorFormDialog } from './_components/sector-form-dialog';

type Sector = RouterOutputs['sectors']['getAll'][number];

export default function SectorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  const { data: sectors = [], isLoading } = api.sectors.getAll.useQuery();

  const handleSelectSector = (sector: Sector) => {
    setSelectedSector(sector);
    setIsFormOpen(true);
  };

  const handleOpenChangeDialog = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedSector(null);
    }
  };

  const filteredSectors = sectors.filter(
    (sector) =>
      sector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sector.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Setores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os setores da empresa para alocação dos colaboradores.
        </p>
      </div>

      <SectorToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewSector={() => {
          setSelectedSector(null);
          setIsFormOpen(true);
        }}
      />

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Carregando setores...
        </div>
      ) : (
        <>
          <div className="block sm:hidden">
            {filteredSectors.map((sector) => (
              <div
                key={sector.id}
                onClick={() => handleSelectSector(sector)}
                className="cursor-pointer"
              >
                <SectorCard sector={sector} />
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <SectorTable
              sectors={filteredSectors}
              onSelectSector={handleSelectSector}
            />
          </div>
        </>
      )}

      <SectorFormDialog
        open={isFormOpen}
        onOpenChange={handleOpenChangeDialog}
        sectorToEdit={selectedSector}
      />
    </div>
  );
}