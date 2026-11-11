'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type RouterOutputs } from '@/trpc/react';
import { shiftSchema, type ShiftInput } from '@/validators/shift';
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
import { Loader2, CalendarClock } from 'lucide-react';
import {
  formatShiftDuration,
  isOvernightShift,
  trimTime,
} from '@/lib/formatters';

type Shift = RouterOutputs['shift']['list'][number];

export type ShiftFormValues = ShiftInput;

interface ShiftFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Shift | null;
  onSubmit: (data: ShiftFormValues) => Promise<void>;
}

export function ShiftFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: ShiftFormDialogProps) {
  const isEditing = !!editing;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: '',
      startTime: '',
      endTime: '',
      description: '',
    },
  });

  const [startTime, endTime] = useWatch({
    control,
    name: ['startTime', 'endTime'],
  });
  const preview = { startTime, endTime };
  const duration = formatShiftDuration(preview);

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        startTime: trimTime(editing.startTime),
        endTime: trimTime(editing.endTime),
        description: editing.description ?? '',
      });
    } else {
      reset({
        name: '',
        startTime: '',
        endTime: '',
        description: '',
      });
    }
  }, [editing, reset, open]);

  const handleFormSubmit = async (data: ShiftFormValues) => {
    const payload = {
      ...data,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      description: data.description || null,
    };

    const actionPromise = onSubmit(payload);

    try {
      await actionPromise;
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
            <CalendarClock className="text-muted-foreground size-5" />
            {isEditing ? 'Editar Turno' : 'Novo Turno'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col"
        >
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Nome do Turno
              </Label>
              <Input
                id="name"
                placeholder="Ex: Turno Matutino, Manhã 12x36"
                {...register('name')}
                className="w-full rounded-md text-sm"
              />
              {errors.name && (
                <p className="text-destructive mt-1 text-[11px]">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-xs font-medium">
                  Entrada
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('startTime')}
                  className="w-full rounded-md text-sm"
                />
                {errors.startTime && (
                  <p className="text-destructive mt-1 text-[11px]">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endTime" className="text-xs font-medium">
                  Saída
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register('endTime')}
                  className="w-full rounded-md text-sm"
                />
                {errors.endTime && (
                  <p className="text-destructive mt-1 text-[11px]">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            {duration && (
              <p className="text-muted-foreground -mt-2 text-xs">
                Duração: {duration}
                {isOvernightShift(preview) && ' · termina no dia seguinte'}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descrição opcional das particularidades do turno..."
                {...register('description')}
                className="min-h-[90px] resize-none rounded-md text-sm"
              />
              {errors.description && (
                <p className="text-destructive mt-1 text-[11px]">
                  {errors.description.message}
                </p>
              )}
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
              {isEditing ? 'Salvar Alterações' : 'Criar Turno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
