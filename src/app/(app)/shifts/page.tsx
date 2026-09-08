'use client';

import { useState } from 'react';
import { api, type RouterOutputs } from '@/trpc/react';
import { ShiftCard } from './_components/shift-card';
import { ShiftTable } from './_components/shift-table';
import { ShiftToolbar } from './_components/shift-toolbar';
import { ShiftFormDialog, type ShiftFormValues } from './_components/shift-form-dialog';

type Shift = RouterOutputs['shifts']['getAll'][number];

export default function ShiftsPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const utils = api.useUtils();
  const { data: shifts = [], isLoading } = api.shifts.getAll.useQuery();

  const createMutation = api.shifts.create.useMutation({
    onSuccess: () => {
      void utils.shifts.getAll.invalidate();
      setDialogOpen(false);
    },
  });

  const updateMutation = api.shifts.update.useMutation({
    onSuccess: () => {
      void utils.shifts.getAll.invalidate();
      setDialogOpen(false);
    },
  });

  const filtered = shifts.filter((shift) =>
    shift.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setSelectedShift(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setDialogOpen(true);
  };

  const handleSubmitForm = async (data: ShiftFormValues) => {
    if (selectedShift) {
      await updateMutation.mutateAsync({
        id: selectedShift.id,
        ...data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Turnos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os turnos e horários de trabalho dos colaboradores.
        </p>
      </div>

      <ShiftToolbar
        search={search}
        onSearchChange={setSearch}
        onNewClick={handleOpenCreate}
      />

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Carregando turnos...
        </div>
      ) : (
        <>
          <div className="block sm:hidden">
            {filtered.map((shift) => (
              <div key={shift.id} onClick={() => handleOpenEdit(shift)} className="cursor-pointer">
                <ShiftCard shift={shift} />
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <ShiftTable shifts={filtered} onSelectShift={handleOpenEdit} />
          </div>
        </>
      )}

      <ShiftFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shift={selectedShift}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}