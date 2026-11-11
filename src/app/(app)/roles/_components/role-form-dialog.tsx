'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type RouterOutputs } from '@/trpc/react';
import { roleSchema, type RoleInput } from '@/validators/role';
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
import { PermissionChecklist } from '@/components/permission-checklist';
import type { Permission } from '@/lib/permissions';

type Role = RouterOutputs['role']['list'][number];

export type RoleFormValues = RoleInput;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Role | null;
  /** Permissões atuais do cargo em edição. */
  permissions?: Permission[];
  onSubmit: (data: RoleFormValues, permissions: Permission[]) => Promise<void>;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  editing,
  permissions = [],
  onSubmit,
}: RoleFormDialogProps) {
  const isEditing = !!editing;
  const [granted, setGranted] = useState<Set<Permission>>(new Set());

  // Recarrega as permissões ao abrir o diálogo ou trocar o cargo (ajuste de estado durante o render)
  const [lastKey, setLastKey] = useState({ open, editing });
  if (lastKey.open !== open || lastKey.editing !== editing) {
    setLastKey({ open, editing });
    setGranted(new Set(permissions));
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        description: editing.description ?? '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [editing, reset, open]);

  const handleFormSubmit = async (data: RoleFormValues) => {
    const payload = {
      ...data,
      description: data.description || null,
    };

    try {
      await onSubmit(payload, [...granted]);
      onOpenChange(false);
    } catch {
      // o aviso de erro já é exibido pelo toast da mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-[500px]">
        <DialogHeader className="bg-background shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="text-muted-foreground size-5" />
            {isEditing ? 'Editar Cargo' : 'Novo Cargo'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col"
        >
          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Nome do Cargo
              </Label>
              <Input
                id="name"
                placeholder="Ex: Desenvolvedor, Gerente de Projetos"
                {...register('name')}
                className="w-full rounded-md text-sm"
              />
              {errors.name && (
                <p className="text-destructive mt-1 text-[11px]">
                  {errors.name.message}
                </p>
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
                className="min-h-[90px] resize-none rounded-md text-sm"
              />
              {errors.description && (
                <p className="text-destructive mt-1 text-[11px]">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Permissões</Label>
              <PermissionChecklist value={granted} onChange={setGranted} />
            </div>
          </div>

          <DialogFooter className="bg-muted/20 shrink-0 gap-2 border-t px-6 py-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md"
            >
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Cargo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
