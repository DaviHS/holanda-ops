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
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-[500px]">
        <DialogHeader className="bg-background shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="text-muted-foreground size-5" />
            {isEditing ? 'Editar Setor' : 'Novo Setor'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col"
        >
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Nome do Setor
              </Label>
              <Input
                id="name"
                placeholder="Ex: Operacional, RH, TI"
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
                placeholder="Descrição opcional das responsabilidades do setor..."
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
              {isEditing ? 'Salvar Alterações' : 'Criar Setor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
