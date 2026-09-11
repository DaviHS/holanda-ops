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

interface DeleteRoleDialogProps {
  roleId: string | null;
  roleName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteRoleDialog({
  roleId,
  roleName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteRoleDialogProps) {
  const utils = api.useUtils();

  const deleteMutation = api.roles.delete.useMutation();

  const handleDelete = () => {
    if (!roleId) return;

    const promise = deleteMutation.mutateAsync({ id: roleId });

    toast.promise(promise, {
      loading: 'Removendo cargo...',
      success: () => {
        utils.roles.getAll.invalidate();
        onOpenChange(false);
        onSuccess?.();
        return 'Cargo removido com sucesso!';
      },
      error: (err) => {
        return err?.message || 'Erro ao remover cargo. Tente novamente.';
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Cargo</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja remover o cargo <strong>{roleName}</strong>? Esta ação não poderá ser desfeita.
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