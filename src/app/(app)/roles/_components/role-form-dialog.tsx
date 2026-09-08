'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type RouterOutputs } from '@/trpc/react';
import { insertRoleSchema, type NewRole } from '@/server/db/schema/roles';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/toast';

type Role = RouterOutputs['roles']['getAll'][number];

export type RoleFormValues = NewRole;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSubmit: (data: RoleFormValues) => Promise<void>;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
}: RoleFormDialogProps) {
  const isEditing = !!role;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(insertRoleSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description ?? '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [role, reset, open]);

  const handleFormSubmit = (data: RoleFormValues) => {
    const payload = {
      ...data,
      description: data.description || null,
    };

    const actionPromise = onSubmit(payload);

    toast.promise(actionPromise, {
      loading: isEditing ? 'Atualizando cargo...' : 'Criando cargo...',
      success: () => {
        onOpenChange(false);
        return isEditing ? 'Cargo atualizado com sucesso!' : 'Cargo criado com sucesso!';
      },
      error: (err) => {
        const message = err?.message || 'Tente novamente.';
        return `Erro ao ${isEditing ? 'atualizar' : 'criar'} cargo: ${message}`;
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] flex flex-col gap-0 p-0 overflow-hidden rounded-md">
        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="size-5 text-muted-foreground" />
            {isEditing ? 'Editar Cargo' : 'Novo Cargo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Nome do Cargo
              </Label>
              <Input
                id="name"
                placeholder="Ex: Desenvolvedor, Gerente de Projetos"
                {...register('name')}
                className="text-sm !h-10 w-full rounded-md"
              />
              {errors.name && (
                <p className="text-[11px] text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descrição opcional das responsabilidades do cargo..."
                {...register('description')}
                className="text-sm rounded-md min-h-[90px] resize-none"
              />
              {errors.description && (
                <p className="text-[11px] text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-3 border-t bg-muted/20 gap-2 sm:gap-0 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-md">
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Cargo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}