'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type RouterOutputs } from '@/trpc/react';
import { insertShiftSchema, type NewShift } from '@/server/db/schema/shifts';
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
import { Loader2, Clock } from 'lucide-react';
import { toast } from '@/components/ui/toast';

type Shift = RouterOutputs['shifts']['getAll'][number];

export type ShiftFormValues = NewShift;

interface ShiftFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: Shift | null;
  onSubmit: (data: ShiftFormValues) => Promise<void>;
}

export function ShiftFormDialog({
  open,
  onOpenChange,
  shift,
  onSubmit,
}: ShiftFormDialogProps) {
  const isEditing = !!shift;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShiftFormValues>({
    resolver: zodResolver(insertShiftSchema),
    defaultValues: {
      name: '',
      startTime: '',
      endTime: '',
      description: '',
    },
  });

  useEffect(() => {
    if (shift) {
      reset({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        description: shift.description ?? '',
      });
    } else {
      reset({
        name: '',
        startTime: '',
        endTime: '',
        description: '',
      });
    }
  }, [shift, reset, open]);

  const handleFormSubmit = (data: ShiftFormValues) => {
    const payload = {
      ...data,
      description: data.description || null,
    };

    const actionPromise = onSubmit(payload);

    toast.promise(actionPromise, {
      loading: isEditing ? 'Atualizando turno...' : 'Criando turno...',
      success: () => {
        onOpenChange(false);
        return isEditing ? 'Turno atualizado com sucesso!' : 'Turno criado com sucesso!';
      },
      error: (err) => {
        const message = err?.message || 'Tente novamente.';
        return `Erro ao ${isEditing ? 'atualizar' : 'criar'} turno: ${message}`;
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] flex flex-col gap-0 p-0 overflow-hidden rounded-md">
        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="size-5 text-muted-foreground" />
            {isEditing ? 'Editar Turno' : 'Novo Turno'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Nome do Turno
              </Label>
              <Input
                id="name"
                placeholder="Ex: Turno Matutino, Manhã 12x36"
                {...register('name')}
                className="text-sm !h-10 w-full rounded-md"
              />
              {errors.name && (
                <p className="text-[11px] text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-xs font-medium">
                  Horário de Entrada
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('startTime')}
                  className="text-sm !h-10 w-full rounded-md"
                />
                {errors.startTime && (
                  <p className="text-[11px] text-destructive mt-1">{errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endTime" className="text-xs font-medium">
                  Horário de Saída
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register('endTime')}
                  className="text-sm !h-10 w-full rounded-md"
                />
                {errors.endTime && (
                  <p className="text-[11px] text-destructive mt-1">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descrição opcional das particularidades do turno..."
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
              {isEditing ? 'Salvar Alterações' : 'Criar Turno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}