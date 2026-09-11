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

interface DeleteSectorDialogProps {
  sectorId: string | null;
  sectorName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteSectorDialog({
  sectorId,
  sectorName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteSectorDialogProps) {
  const utils = api.useUtils();

  const deleteMutation = api.sectors.delete.useMutation();

  const handleDelete = () => {
    if (!sectorId) return;

    const promise = deleteMutation.mutateAsync({ id: sectorId });

    toast.promise(promise, {
      loading: 'Removendo setor...',
      success: () => {
        utils.sectors.getAll.invalidate();
        onOpenChange(false);
        onSuccess?.();
        return 'Setor removido com sucesso!';
      },
      error: (err) => {
        return err?.message || 'Erro ao remover setor. Tente novamente.';
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Setor</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja remover o setor <strong>{sectorName}</strong>? Esta ação não poderá ser desfeita.
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