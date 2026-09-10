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
import { type Employee, insertEmployeeSchema } from '@/server/db/schema/employees';
import { z } from 'zod';

import { toast } from '@/components/ui/toast';

export type EmployeeFormValues = z.infer<typeof insertEmployeeSchema>;

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
  employee?: (Employee & { sectorIds?: string[]; shiftId?: string | null }) | null;
  sectorsList?: SectorItem[];
  shiftsList?: ShiftItem[];
  onSubmit: (data: EmployeeFormValues) => void;
  isSubmitting?: boolean;
};

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  sectorsList = [],
  shiftsList = [],
  onSubmit,
  isSubmitting = false,
}: EmployeeFormDialogProps) {
  const isEditing = !!employee;
  const [openCombobox, setOpenCombobox] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(insertEmployeeSchema) as Resolver<EmployeeFormValues>,
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
    if (employee) {
      reset({
        name: employee.name,
        cpf: employee.cpf,
        rg: employee.rg ?? '',
        pixKey: employee.pixKey ?? '',
        address: employee.address ?? '',
        sectorIds: employee.sectorIds ?? [],
        shiftId: employee.shiftId ?? null,
        status: employee.status,
        shirtSize: employee.shirtSize,
        pantsSize: employee.pantsSize ?? '',
        shoeSize: employee.shoeSize ?? undefined,
        uniform: {
          shirt: employee.uniform.shirt,
          pants: employee.uniform.pants,
          shoes: employee.uniform.shoes,
          jacket: employee.uniform.jacket ?? false,
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
  }, [employee, reset, open]);

  const handleFormSubmit = (data: EmployeeFormValues) => {
    const payload: EmployeeFormValues = {
      ...data,
      rg: data.rg || null,
      pixKey: data.pixKey || null,
      address: data.address || null,
      pantsSize: data.pantsSize || null,
      shoeSize: data.shoeSize && !isNaN(Number(data.shoeSize)) ? Number(data.shoeSize) : null,
    };

    toast.promise(
      new Promise((resolve, reject) => {
        try {
          const result = onSubmit(payload);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }),
      {
        loading: isEditing ? 'Atualizando colaborador...' : 'Cadastrando colaborador...',
        success: isEditing ? 'Colaborador atualizado com sucesso!' : 'Colaborador cadastrado com sucesso!',
        error: (err) => {
          const message = err?.message || 'tente novamente.';
          return `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'}: ${message}`;
        },
      }
    );
  };

  const selectedSectorIds = watch('sectorIds') ?? [];
  const currentUniforms = watch('uniform');
  const currentShiftId = watch('shiftId');
  const currentStatus = watch('status');

  const handleSelectSector = (sectorId: string) => {
    if (!selectedSectorIds.includes(sectorId)) {
      setValue('sectorIds', [...selectedSectorIds, sectorId], { shouldValidate: true });
    }
    setOpenCombobox(false);
  };

  const handleRemoveSector = (sectorId: string) => {
    setValue(
      'sectorIds',
      selectedSectorIds.filter((id) => id !== sectorId),
      { shouldValidate: true }
    );
  };

  const toggleUniformItem = (key: keyof NonNullable<EmployeeFormValues['uniform']>) => {
    setValue(`uniform.${key}`, !currentUniforms?.[key]);
  };

  const handleShiftSelect = (val: unknown) => {
    if (typeof val !== 'string') return;
    const selected = shiftsList.find((s) => s.id === val);
    if (selected) {
      setValue('shiftId', selected.id, { shouldValidate: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] flex flex-col gap-0 p-0 overflow-hidden max-h-[88vh] rounded-md">
        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {isEditing ? 'Editar Colaborador' : 'Cadastrar Colaborador'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) => handleFormSubmit(data as EmployeeFormValues))}
          className="flex flex-col flex-1 overflow-hidden min-h-0"
        >
          <Tabs defaultValue="pessoais" className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="px-6 py-3 bg-muted/40 border-b shrink-0">
              <TabsList className="w-full grid grid-cols-3 h-10 p-1 bg-muted/80 rounded-md">
                <TabsTrigger value="pessoais" className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-md">
                  <User className="size-3.5 shrink-0" />
                  <span className="truncate">Pessoais</span>
                </TabsTrigger>
                <TabsTrigger value="operacional" className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-md">
                  <Briefcase className="size-3.5 shrink-0" />
                  <span className="truncate">Alocação</span>
                </TabsTrigger>
                <TabsTrigger value="uniformes" className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-md">
                  <Shirt className="size-3.5 shrink-0" />
                  <span className="truncate">Uniformes</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
              <TabsContent value="pessoais" className="mt-0 space-y-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12">
                    <Label className="text-xs font-medium">Nome Completo</Label>
                    <Input {...register('name')} placeholder="Ex: João da Silva" className="mt-1 text-sm !h-10 w-full rounded-md" />
                    {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name.message}</p>}
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <Label className="text-xs font-medium">CPF</Label>
                    <Input {...register('cpf')} placeholder="000.000.000-00" className="mt-1 font-mono text-sm !h-10 w-full rounded-md" />
                    {errors.cpf && <p className="text-[11px] text-destructive mt-1">{errors.cpf.message}</p>}
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <Label className="text-xs font-medium">RG</Label>
                    <Input {...register('rg')} placeholder="00.000.000-0" className="mt-1 font-mono text-sm !h-10 w-full rounded-md" />
                  </div>

                  <div className="col-span-12">
                    <Label className="text-xs font-medium">Chave Pix</Label>
                    <Input {...register('pixKey')} placeholder="E-mail, CPF, telefone ou chave aleatória" className="mt-1 text-sm !h-10 w-full rounded-md" />
                  </div>

                  <div className="col-span-12">
                    <Label className="text-xs font-medium">Endereço Residencial</Label>
                    <Input {...register('address')} placeholder="Rua, número, complemento e bairro" className="mt-1 text-sm !h-10 w-full rounded-md" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="operacional" className="mt-0 space-y-4">
                <div className="p-4 rounded-md border bg-card/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <MapPin className="size-3.5" />
                    <span>Lotação e Situação</span>
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 sm:col-span-8">
                      <Label className="text-xs font-medium">Buscar e Adicionar Setores</Label>
                      
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCombobox}
                              className="w-full justify-between font-normal text-muted-foreground !h-10 rounded-md text-sm"
                            />
                          }
                        >
                          <span>Pesquisar setor...</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </PopoverTrigger>
                        
                        <PopoverContent className="w-[340px] p-0 rounded-md" align="start">
                          <Command>
                            <CommandInput placeholder="Digite o nome do setor..." />
                            <CommandList>
                              <CommandEmpty>Nenhum setor encontrado.</CommandEmpty>
                              <CommandGroup>
                                {sectorsList.map((sec) => {
                                  const isSelected = selectedSectorIds.includes(sec.id);
                                  return (
                                    <CommandItem
                                      key={sec.id}
                                      value={sec.name}
                                      onSelect={() => handleSelectSector(sec.id)}
                                      className="text-sm py-2 rounded-none"
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          isSelected ? 'opacity-100' : 'opacity-0'
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
                      <Label className="text-xs font-medium">Status do Contrato</Label>
                      <Select
                        value={currentStatus || 'active'}
                        onValueChange={(val) => val && setValue('status', val as 'active' | 'inactive')}
                      >
                        <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-md">
                          <SelectValue placeholder="Selecione">
                            {currentStatus === 'inactive' ? 'Inativo' : 'Ativo'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                          <SelectItem value="active" className="text-sm py-2 rounded-none">Ativo</SelectItem>
                          <SelectItem value="inactive" className="text-sm py-2 rounded-none">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-12">
                      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Setores Selecionados
                      </Label>
                      <div className="min-h-[52px] p-2.5 rounded-md border bg-background flex flex-wrap gap-1.5 items-center">
                        {selectedSectorIds.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Nenhum setor vinculado.</span>
                        ) : (
                          selectedSectorIds.map((id) => {
                            const sectorObj = sectorsList.find((s) => s.id === id);
                            return (
                              <Badge
                                key={id}
                                variant="secondary"
                                className="flex items-center gap-1 pl-2.5 pr-1 py-1 text-xs font-normal rounded-md bg-muted/80 hover:bg-muted"
                              >
                                <span>{sectorObj?.name ?? 'Setor'}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSector(id)}
                                  className="rounded-full hover:bg-black/10 dark:hover:bg-white/20 p-0.5 transition-colors"
                                >
                                  <X className="size-3" />
                                </button>
                              </Badge>
                            );
                          })
                        )}
                      </div>
                      {errors.sectorIds && (
                        <p className="text-[11px] text-destructive mt-1">{errors.sectorIds.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-md border bg-card/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Clock className="size-3.5" />
                    <span>Jornada de Trabalho</span>
                  </div>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12">
                      <Label className="text-xs font-medium">Jornada / Turno Cadastrado</Label>
                      <Select
                        value={currentShiftId ?? ''}
                        onValueChange={handleShiftSelect}
                      >
                        <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-md">
                          <SelectValue placeholder="Selecione o turno de trabalho">
                            {(() => {
                              const selected = shiftsList.find((s) => s.id === currentShiftId);
                              if (!selected) return null;
                              return `${selected.name}${selected.startTime && selected.endTime ? ` (${selected.startTime} - ${selected.endTime})` : ''}`;
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                          {shiftsList.map((item) => (
                            <SelectItem key={item.id} value={item.id} className="text-sm py-2 rounded-none">
                              {item.name} {item.startTime && item.endTime ? `(${item.startTime} - ${item.endTime})` : ''}
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
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Especificação de Grades e Tamanhos
                  </Label>
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-md border bg-card/50">
                    <div className="flex flex-col justify-start">
                      <Label className="text-xs font-medium h-4 flex items-center">Camisa</Label>
                      <Select
                        value={watch('shirtSize') || 'M'}
                        onValueChange={(val) => val && setValue('shirtSize', val as EmployeeFormValues['shirtSize'])}
                      >
                        <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                            <SelectItem key={size} value={size} className="text-sm py-1.5 rounded-none">{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col justify-start">
                      <Label className="text-xs font-medium h-4 flex items-center">Calça</Label>
                      <Input {...register('pantsSize')} placeholder="Ex: 42" className="mt-1 text-sm !h-10 w-full rounded-md" />
                    </div>

                    <div className="flex flex-col justify-start">
                      <Label className="text-xs font-medium h-4 flex items-center">Calçado</Label>
                      <Input
                        type="number"
                        {...register('shoeSize', { valueAsNumber: true })}
                        placeholder="Ex: 40"
                        className="mt-1 text-sm font-mono !h-10 w-full rounded-md"
                      />
                      {errors.shoeSize && <p className="text-[11px] text-destructive mt-1">{errors.shoeSize.message}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Itens do Kit Entregues
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                          className={`flex items-center justify-between px-3 !h-10 rounded-md border text-left transition-all ${
                            isDelivered
                              ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                              : 'bg-card border-border hover:border-muted-foreground/30 text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <PackageCheck className={`size-4 shrink-0 ${isDelivered ? 'text-primary' : 'text-muted-foreground/50'}`} />
                            <span className="text-sm truncate">{item.label}</span>
                          </div>
                          <CheckCircle2
                            className={`size-4 shrink-0 transition-opacity ${
                              isDelivered ? 'opacity-100 text-primary' : 'opacity-0'
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
              {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}