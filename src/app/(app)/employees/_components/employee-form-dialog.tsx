'use client';

import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Briefcase,
  Shirt,
  CheckCircle2,
  Clock,
  MapPin,
  PackageCheck,
  Loader2,
  ChevronsUpDown,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Employee } from '@/server/db/schema/employees';
import { employeeSchema } from '@/validators/employee';
import { type z } from 'zod';

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

type SectorItem = { id: string; name: string };
type ShiftItem = {
  id: string;
  name: string;
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
};

type EmployeeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?:
    (Employee & { sectorIds?: string[]; shiftId?: string | null }) | null;
  sectors?: SectorItem[];
  shifts?: ShiftItem[];
  onSubmit: (data: EmployeeFormValues) => void;
  isSubmitting?: boolean;
};

export function EmployeeFormDialog({
  open,
  onOpenChange,
  editing,
  sectors = [],
  shifts = [],
  onSubmit,
  isSubmitting = false,
}: EmployeeFormDialogProps) {
  const isEditing = !!editing;
  const [openCombobox, setOpenCombobox] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema) as Resolver<EmployeeFormValues>,
    defaultValues: {
      name: '',
      cpf: '',
      rg: '',
      pixKey: '',
      address: '',
      sectorIds: [],
      shiftId: null,
      status: 'active',
      shirtSize: 'M',
      pantsSize: '',
      shoeSize: undefined,
      uniform: { shirt: false, pants: false, shoes: false, jacket: false },
    },
  });

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        cpf: editing.cpf,
        rg: editing.rg ?? '',
        pixKey: editing.pixKey ?? '',
        address: editing.address ?? '',
        sectorIds: editing.sectorIds ?? [],
        shiftId: editing.shiftId ?? null,
        status: editing.status,
        shirtSize: editing.shirtSize,
        pantsSize: editing.pantsSize ?? '',
        shoeSize: editing.shoeSize ?? undefined,
        uniform: {
          shirt: editing.uniform.shirt,
          pants: editing.uniform.pants,
          shoes: editing.uniform.shoes,
          jacket: editing.uniform.jacket ?? false,
        },
      });
    } else {
      reset({
        name: '',
        cpf: '',
        rg: '',
        pixKey: '',
        address: '',
        sectorIds: [],
        shiftId: null,
        shirtSize: 'M',
        pantsSize: '',
        shoeSize: undefined,
        status: 'active',
        uniform: { shirt: false, pants: false, shoes: false, jacket: false },
      });
    }
  }, [editing, reset, open]);

  const handleFormSubmit = async (data: EmployeeFormValues) => {
    const payload: EmployeeFormValues = {
      ...data,
      rg: data.rg || null,
      pixKey: data.pixKey || null,
      address: data.address || null,
      pantsSize: data.pantsSize || null,
      shoeSize:
        data.shoeSize && !isNaN(Number(data.shoeSize))
          ? Number(data.shoeSize)
          : null,
    };

    try {
      await Promise.resolve().then(() => onSubmit(payload));
      onOpenChange(false);
    } catch {
      // o aviso de erro já é exibido pelo toast da mutation
    }
  };

  const selectedSectorIds = watch('sectorIds') ?? [];
  const currentUniforms = watch('uniform');
  const currentShiftId = watch('shiftId');
  const currentStatus = watch('status');

  const handleSelectSector = (sectorId: string) => {
    if (!selectedSectorIds.includes(sectorId)) {
      setValue('sectorIds', [...selectedSectorIds, sectorId], {
        shouldValidate: true,
      });
    }
    setOpenCombobox(false);
  };

  const handleRemoveSector = (sectorId: string) => {
    setValue(
      'sectorIds',
      selectedSectorIds.filter((id) => id !== sectorId),
      { shouldValidate: true },
    );
  };

  const toggleUniformItem = (
    key: keyof NonNullable<EmployeeFormValues['uniform']>,
  ) => {
    setValue(`uniform.${key}`, !currentUniforms?.[key]);
  };

  const handleShiftSelect = (val: unknown) => {
    if (typeof val !== 'string') return;
    const selected = shifts.find((s) => s.id === val);
    if (selected) {
      setValue('shiftId', selected.id, { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-[620px]">
        <DialogHeader className="bg-background shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            {isEditing ? 'Editar Colaborador' : 'Cadastrar Colaborador'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) => handleFormSubmit(data))}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <Tabs
            defaultValue="pessoais"
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className="bg-muted/40 shrink-0 border-b px-6 py-3">
              <TabsList className="bg-muted/80 grid h-10 w-full grid-cols-3 rounded-md p-1">
                <TabsTrigger
                  value="pessoais"
                  className="flex w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium"
                >
                  <User className="size-3.5 shrink-0" />
                  <span className="truncate">Pessoais</span>
                </TabsTrigger>
                <TabsTrigger
                  value="operacional"
                  className="flex w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium"
                >
                  <Briefcase className="size-3.5 shrink-0" />
                  <span className="truncate">Alocação</span>
                </TabsTrigger>
                <TabsTrigger
                  value="uniformes"
                  className="flex w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium"
                >
                  <Shirt className="size-3.5 shrink-0" />
                  <span className="truncate">Uniformes</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <TabsContent value="pessoais" className="mt-0 space-y-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12">
                    <Label className="text-xs font-medium">Nome Completo</Label>
                    <Input
                      {...register('name')}
                      placeholder="Ex: João da Silva"
                      className="mt-1 w-full rounded-md text-sm"
                    />
                    {errors.name && (
                      <p className="text-destructive mt-1 text-[11px]">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <Label className="text-xs font-medium">CPF</Label>
                    <Input
                      {...register('cpf')}
                      placeholder="000.000.000-00"
                      className="mt-1 w-full rounded-md font-mono text-sm"
                    />
                    {errors.cpf && (
                      <p className="text-destructive mt-1 text-[11px]">
                        {errors.cpf.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <Label className="text-xs font-medium">RG</Label>
                    <Input
                      {...register('rg')}
                      placeholder="00.000.000-0"
                      className="mt-1 w-full rounded-md font-mono text-sm"
                    />
                  </div>

                  <div className="col-span-12">
                    <Label className="text-xs font-medium">Chave Pix</Label>
                    <Input
                      {...register('pixKey')}
                      placeholder="E-mail, CPF, telefone ou chave aleatória"
                      className="mt-1 w-full rounded-md text-sm"
                    />
                  </div>

                  <div className="col-span-12">
                    <Label className="text-xs font-medium">
                      Endereço Residencial
                    </Label>
                    <Input
                      {...register('address')}
                      placeholder="Rua, número, complemento e bairro"
                      className="mt-1 w-full rounded-md text-sm"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="operacional" className="mt-0 space-y-4">
                <div className="bg-card/50 space-y-3 rounded-md border p-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                    <MapPin className="size-3.5" />
                    <span>Lotação e Situação</span>
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 sm:col-span-8">
                      <Label className="text-xs font-medium">
                        Buscar e Adicionar Setores
                      </Label>

                      <Popover
                        open={openCombobox}
                        onOpenChange={setOpenCombobox}
                      >
                        <PopoverTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCombobox}
                              className="text-muted-foreground w-full justify-between rounded-md text-sm font-normal"
                            />
                          }
                        >
                          <span>Pesquisar setor...</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </PopoverTrigger>

                        <PopoverContent
                          className="w-[340px] rounded-md p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput placeholder="Digite o nome do setor..." />
                            <CommandList>
                              <CommandEmpty>
                                Nenhum setor encontrado.
                              </CommandEmpty>
                              <CommandGroup>
                                {sectors.map((sec) => {
                                  const isSelected = selectedSectorIds.includes(
                                    sec.id,
                                  );
                                  return (
                                    <CommandItem
                                      key={sec.id}
                                      value={sec.name}
                                      onSelect={() =>
                                        handleSelectSector(sec.id)
                                      }
                                      className="rounded-none py-2 text-sm"
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          isSelected
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      {sec.name}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="col-span-12 sm:col-span-4">
                      <Label className="text-xs font-medium">
                        Status do Contrato
                      </Label>
                      <Select
                        value={currentStatus || 'active'}
                        onValueChange={(val) =>
                          val &&
                          setValue('status', val as 'active' | 'inactive')
                        }
                      >
                        <SelectTrigger className="mt-1 w-full rounded-md text-sm">
                          <SelectValue placeholder="Selecione">
                            {currentStatus === 'inactive' ? 'Inativo' : 'Ativo'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                          <SelectItem
                            value="active"
                            className="rounded-none py-2 text-sm"
                          >
                            Ativo
                          </SelectItem>
                          <SelectItem
                            value="inactive"
                            className="rounded-none py-2 text-sm"
                          >
                            Inativo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-12">
                      <Label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                        Setores Selecionados
                      </Label>
                      <div className="bg-background flex min-h-[52px] flex-wrap items-center gap-1.5 rounded-md border p-2.5">
                        {selectedSectorIds.length === 0 ? (
                          <span className="text-muted-foreground text-xs">
                            Nenhum setor vinculado.
                          </span>
                        ) : (
                          selectedSectorIds.map((id) => {
                            const sectorObj = sectors.find((s) => s.id === id);
                            return (
                              <Badge
                                key={id}
                                variant="secondary"
                                className="bg-muted/80 hover:bg-muted flex items-center gap-1 rounded-md py-1 pr-1 pl-2.5 text-xs font-normal"
                              >
                                <span>{sectorObj?.name ?? 'Setor'}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSector(id)}
                                  className="rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/20"
                                >
                                  <X className="size-3" />
                                </button>
                              </Badge>
                            );
                          })
                        )}
                      </div>
                      {errors.sectorIds && (
                        <p className="text-destructive mt-1 text-[11px]">
                          {errors.sectorIds.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-card/50 space-y-3 rounded-md border p-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                    <Clock className="size-3.5" />
                    <span>Jornada de Trabalho</span>
                  </div>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12">
                      <Label className="text-xs font-medium">
                        Jornada / Turno Cadastrado
                      </Label>
                      <Select
                        value={currentShiftId ?? ''}
                        onValueChange={handleShiftSelect}
                      >
                        <SelectTrigger className="mt-1 w-full rounded-md text-sm">
                          <SelectValue placeholder="Selecione o turno de trabalho">
                            {(() => {
                              const selected = shifts.find(
                                (s) => s.id === currentShiftId,
                              );
                              if (!selected) return null;
                              return `${selected.name}${selected.startTime && selected.endTime ? ` (${selected.startTime} - ${selected.endTime})` : ''}`;
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                          {shifts.map((item) => (
                            <SelectItem
                              key={item.id}
                              value={item.id}
                              className="rounded-none py-2 text-sm"
                            >
                              {item.name}{' '}
                              {item.startTime && item.endTime
                                ? `(${item.startTime} - ${item.endTime})`
                                : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="uniformes" className="mt-0 space-y-5">
                <div>
                  <Label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Especificação de Grades e Tamanhos
                  </Label>
                  <div className="bg-card/50 grid grid-cols-3 gap-3 rounded-md border p-3.5">
                    <div className="flex flex-col justify-start">
                      <Label className="flex h-4 items-center text-xs font-medium">
                        Camisa
                      </Label>
                      <Select
                        value={watch('shirtSize') || 'M'}
                        onValueChange={(val) =>
                          val && setValue('shirtSize', val)
                        }
                      >
                        <SelectTrigger className="mt-1 w-full rounded-md text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                          {['PP', 'P', 'M', 'G', 'GG', 'XGG'].map((size) => (
                            <SelectItem
                              key={size}
                              value={size}
                              className="rounded-none py-1.5 text-sm"
                            >
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col justify-start">
                      <Label className="flex h-4 items-center text-xs font-medium">
                        Calça
                      </Label>
                      <Input
                        {...register('pantsSize')}
                        placeholder="Ex: 42"
                        className="mt-1 w-full rounded-md text-sm"
                      />
                    </div>

                    <div className="flex flex-col justify-start">
                      <Label className="flex h-4 items-center text-xs font-medium">
                        Calçado
                      </Label>
                      <Input
                        type="number"
                        {...register('shoeSize', { valueAsNumber: true })}
                        placeholder="Ex: 40"
                        className="mt-1 w-full rounded-md font-mono text-sm"
                      />
                      {errors.shoeSize && (
                        <p className="text-destructive mt-1 text-[11px]">
                          {errors.shoeSize.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Itens do Kit Entregues
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { key: 'shirt' as const, label: 'Camisa' },
                      { key: 'pants' as const, label: 'Calça' },
                      { key: 'shoes' as const, label: 'Calçado' },
                      { key: 'jacket' as const, label: 'Jaqueta' },
                    ].map((item) => {
                      const isDelivered = currentUniforms?.[item.key];
                      return (
                        <button
                          type="button"
                          key={item.key}
                          onClick={() => toggleUniformItem(item.key)}
                          className={`flex items-center justify-between rounded-md border px-3 text-left transition-all ${
                            isDelivered
                              ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                              : 'bg-card border-border hover:border-muted-foreground/30 text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <PackageCheck
                              className={`size-4 shrink-0 ${isDelivered ? 'text-primary' : 'text-muted-foreground/50'}`}
                            />
                            <span className="truncate text-sm">
                              {item.label}
                            </span>
                          </div>
                          <CheckCircle2
                            className={`size-4 shrink-0 transition-opacity ${
                              isDelivered
                                ? 'text-primary opacity-100'
                                : 'opacity-0'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

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
              {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
