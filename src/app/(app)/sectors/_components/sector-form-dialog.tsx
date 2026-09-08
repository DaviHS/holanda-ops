'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/trpc/react';
import { insertSectorSchema, type NewSector, type Sector } from '@/server/db/schema/sectors';
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
import { Loader2, Building2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface SectorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectorToEdit?: Sector | null;
}

export function SectorFormDialog({ open, onOpenChange, sectorToEdit }: SectorFormDialogProps) {
  const utils = api.useUtils();
  const isEditing = !!sectorToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewSector>({
    resolver: zodResolver(insertSectorSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (sectorToEdit) {
      reset({
        name: sectorToEdit.name,
        description: sectorToEdit.description ?? '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [sectorToEdit, reset, open]);

  const createMutation = api.sectors.create.useMutation({
    onSuccess: () => utils.sectors.getAll.invalidate(),
  });

  const updateMutation = api.sectors.update.useMutation({
    onSuccess: () => utils.sectors.getAll.invalidate(),
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleFormSubmit = (data: NewSector) => {
    const payload = {
      ...data,
      description: data.description || null,
    };

    const actionPromise = isEditing
      ? updateMutation.mutateAsync({ id: sectorToEdit.id, ...payload })
      : createMutation.mutateAsync(payload);

    toast.promise(actionPromise, {
      loading: isEditing ? 'Atualizando setor...' : 'Criando setor...',
      success: () => {
        onOpenChange(false);
        return isEditing ? 'Setor atualizado com sucesso!' : 'Setor criado com sucesso!';
      },
      error: (err) => {
        const message = err?.message || 'Tente novamente.';
        return `Erro ao ${isEditing ? 'atualizar' : 'criar'} setor: ${message}`;
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] flex flex-col gap-0 p-0 overflow-hidden rounded-md">
        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="size-5 text-muted-foreground" />
            {isEditing ? 'Editar Setor' : 'Novo Setor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Nome do Setor
              </Label>
              <Input
                id="name"
                placeholder="Ex: Operacional, RH, TI"
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
                placeholder="Descrição opcional das responsabilidades do setor..."
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
              disabled={isLoading}
              className="rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-md">
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Setor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}