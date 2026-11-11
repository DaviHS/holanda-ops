'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type RouterOutputs } from '@/trpc/react';
import { sectorSchema, type SectorInput } from '@/validators/sector';
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

type Sector = RouterOutputs['sector']['list'][number];

export type SectorFormValues = SectorInput;

interface SectorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Sector | null;
  onSubmit: (data: SectorFormValues) => Promise<void>;
}

export function SectorFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: SectorFormDialogProps) {
  const isEditing = !!editing;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SectorFormValues>({
    resolver: zodResolver(sectorSchema),
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

  const handleFormSubmit = async (data: SectorFormValues) => {
    const payload = {
      ...data,
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
              disabled={isSubmitting}
              className="rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-md">
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Setor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}