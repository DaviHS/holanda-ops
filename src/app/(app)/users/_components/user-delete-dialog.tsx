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

interface DeleteUserDialogProps {
  userId: string | null;
  userName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  userId,
  userName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteUserDialogProps) {
  const utils = api.useUtils();

  const deleteMutation = api.users.delete.useMutation();

  const handleDelete = () => {
    if (!userId) return;

    const promise = deleteMutation.mutateAsync({ id: userId });

    toast.promise(promise, {
      loading: 'Removendo usuário...',
      success: () => {
        utils.users.getAll.invalidate();
        onOpenChange(false);
        onSuccess?.();
        return 'Usuário removido com sucesso!';
      },
      error: (err) => {
        return err?.message || 'Erro ao remover usuário. Tente novamente.';
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja remover o usuário <strong>{userName}</strong>? Esta ação não poderá ser desfeita.
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