'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

interface DeleteShiftDialogProps {
  shiftId: string | null;
  shiftName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteShiftDialog({
  shiftId,
  shiftName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteShiftDialogProps) {
  const utils = api.useUtils();

  const deleteMutation = api.shifts.delete.useMutation({
    onSuccess: () => {
      toast.success('Turno removido com sucesso!');
      utils.shifts.getAll.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao remover turno.');
    },
  });

  const handleDelete = () => {
    if (shiftId) {
      deleteMutation.mutate({ id: shiftId });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Turno</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja remover o turno <strong>{shiftName}</strong>? Esta ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending} className="rounded-md">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteMutation.isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md"
          >
            {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}