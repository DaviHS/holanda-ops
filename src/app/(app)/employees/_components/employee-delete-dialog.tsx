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

interface DeleteEmployeeDialogProps {
  employeeId: string | null;
  employeeName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteEmployeeDialog({
  employeeId,
  employeeName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteEmployeeDialogProps) {
  const utils = api.useUtils();

  const deleteMutation = api.employees.delete.useMutation();

  const handleDelete = () => {
    if (!employeeId) return;

    const promise = deleteMutation.mutateAsync({ id: employeeId });

    toast.promise(promise, {
      loading: 'Removendo funcionário...',
      success: () => {
        utils.employees.getAll.invalidate();
        onOpenChange(false);
        onSuccess?.();
        return 'Funcionário removido com sucesso!';
      },
      error: (err) => {
        return err?.message || 'Erro ao remover funcionário. Tente novamente.';
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Funcionário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja remover <strong>{employeeName}</strong>? Esta ação <strong>inativará o registro</strong>.
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