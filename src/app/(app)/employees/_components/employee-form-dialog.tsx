'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/trpc/react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatCpf, formatShiftTime } from '@/lib/formatters';
import { EMPLOYEE_STATUS, EMPLOYEE_STATUSES } from '@/lib/employee-status';
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
import { EmployeeAvatarField } from './employee-avatar-field';
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
  onSubmit: (data: EmployeeFormValues) => void | Promise<void>;

  readOnly?: boolean;
};

type TabKey = 'pessoais' | 'operacional' | 'uniformes';

const FIELD_TAB: Partial<Record<keyof EmployeeFormValues, TabKey>> = {
  name: 'pessoais',
  cpf: 'pessoais',
  rg: 'pessoais',
  pixKey: 'pessoais',
  address: 'pessoais',
  sectorIds: 'operacional',
  shiftId: 'operacional',
  status: 'operacional',
  shirtSize: 'uniformes',
  pantsSize: 'uniformes',
  shoeSize: 'uniformes',
  uniform: 'uniformes',
};

export function EmployeeFormDialog({
  open,
  onOpenChange,
  editing,
  sectors = [],
  shifts = [],
  onSubmit,
  readOnly = false,
}: EmployeeFormDialogProps) {
  const isEditing = !!editing;
  const [openCombobox, setOpenCombobox] = useState(false);
  const [tab, setTab] = useState<TabKey>('pessoais');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const sessionUploads = useRef<string[]>([]);
  const discardUpload = api.employee.discardUpload.useMutation();

  const discard = (url: string) => {
    sessionUploads.current = sessionUploads.current.filter((u) => u !== url);
    discardUpload.mutate({ url });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      sessionUploads.current.forEach((url) => discardUpload.mutate({ url }));
      sessionUploads.current = [];
    }
    onOpenChange(next);
  };

  const [lastOpen, setLastOpen] = useState(open);
  if (lastOpen !== open) {
    setLastOpen(open);
    if (open) setTab('pessoais');
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema) as Resolver<EmployeeFormValues>,
    defaultValues: {
      name: '',
      cpf: '',
      rg: '',
      pixKey: '',
      address: '',
      avatarUrl: null,
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
        cpf: formatCpf(editing.cpf),
        rg: editing.rg ?? '',
        pixKey: editing.pixKey ?? '',
        address: editing.address ?? '',
        avatarUrl: editing.avatarUrl ?? null,
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
        avatarUrl: null,
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

      sessionUploads.current = [];
      onOpenChange(false);
    } catch {}
  };

  const tabHasError = (key: TabKey) =>
    (Object.keys(errors) as (keyof EmployeeFormValues)[]).some(
      (field) => FIELD_TAB[field] === key,
    );

  const handleInvalid = (invalid: typeof errors) => {
    const first = (Object.keys(invalid) as (keyof EmployeeFormValues)[])
      .map((field) => FIELD_TAB[field])
      .find(Boolean);
    if (first) setTab(first);
  };

  const selectedSectorIds = watch('sectorIds') ?? [];
  const currentUniforms = watch('uniform');
  const currentShiftId = watch('shiftId');
  const currentStatus = watch('status');
  const currentAvatar = watch('avatarUrl');

  const handleToggleSector = (sectorId: string) => {
    setValue(
      'sectorIds',
      selectedSectorIds.includes(sectorId)
        ? selectedSectorIds.filter((id) => id !== sectorId)
        : [...selectedSectorIds, sectorId],
      { shouldValidate: true },
    );
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-[620px]">
        <DialogHeader className="bg-background shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            {readOnly
              ? 'Dados do Colaborador'
              : isEditing
                ? 'Editar Colaborador'
                : 'Cadastrar Colaborador'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit, handleInvalid)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as TabKey)}
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
                  {tabHasError('pessoais') && (
                    <span
                      className="bg-destructive size-1.5 shrink-0 rounded-full"
                      role="img"
                      aria-label="Há campos com erro"
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="operacional"
                  className="flex w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium"
                >
                  <Briefcase className="size-3.5 shrink-0" />
                  <span className="truncate">Alocação</span>
                  {tabHasError('operacional') && (
                    <span
                      className="bg-destructive size-1.5 shrink-0 rounded-full"
                      role="img"
                      aria-label="Há campos com erro"
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="uniformes"
                  className="flex w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium"
                >
                  <Shirt className="size-3.5 shrink-0" />
                  <span className="truncate">Uniformes</span>
                  {tabHasError('uniformes') && (
                    <span
                      className="bg-destructive size-1.5 shrink-0 rounded-full"
                      role="img"
                      aria-label="Há campos com erro"
                    />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <fieldset
              disabled={readOnly}
              className="m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 px-6 py-5"
            >
              <TabsContent value="pessoais" className="mt-0 space-y-4">
                <EmployeeAvatarField
                  value={currentAvatar}
                  onChange={(url) => {
                    if (
                      currentAvatar &&
                      currentAvatar !== url &&
                      sessionUploads.current.includes(currentAvatar)
                    ) {
                      discard(currentAvatar);
                    }
                    if (url) sessionUploads.current.push(url);
                    setValue('avatarUrl', url);
                  }}
                  onUploadingChange={setUploadingAvatar}
                  disabled={readOnly}
                />
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12">
                    <Label htmlFor="emp-name" className="text-xs font-medium">
                      Nome Completo
                    </Label>
                    <Input
                      id="emp-name"
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
                    <Label htmlFor="emp-cpf" className="text-xs font-medium">
                      CPF
                    </Label>
                    <Input
                      id="emp-cpf"
                      inputMode="numeric"
                      maxLength={14}
                      {...register('cpf', {
                        onChange: (
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => {
                          event.target.value = formatCpf(event.target.value);
                        },
                      })}
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
                    <Label htmlFor="emp-rg" className="text-xs font-medium">
                      RG
                    </Label>
                    <Input
                      id="emp-rg"
                      {...register('rg')}
                      placeholder="00.000.000-0"
                      className="mt-1 w-full rounded-md font-mono text-sm"
                    />
                  </div>

                  <div className="col-span-12">
                    <Label htmlFor="emp-pix" className="text-xs font-medium">
                      Chave Pix
                    </Label>
                    <Input
                      id="emp-pix"
                      {...register('pixKey')}
                      placeholder="E-mail, CPF, telefone ou chave aleatória"
                      className="mt-1 w-full rounded-md text-sm"
                    />
                  </div>

                  <div className="col-span-12">
                    <Label
                      htmlFor="emp-address"
                      className="text-xs font-medium"
                    >
                      Endereço Residencial
                    </Label>
                    <Input
                      id="emp-address"
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
                          <span>
                            {selectedSectorIds.length === 0
                              ? 'Pesquisar setor...'
                              : `${selectedSectorIds.length} setor(es) selecionado(s)`}
                          </span>
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
                                        handleToggleSector(sec.id)
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
                        onValueChange={(val) => val && setValue('status', val)}
                      >
                        <SelectTrigger className="mt-1 w-full rounded-md text-sm">
                          <SelectValue placeholder="Selecione">
                            {EMPLOYEE_STATUS[currentStatus ?? 'active'].label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-md">
                          {EMPLOYEE_STATUSES.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              className="rounded-none py-2 text-sm"
                            >
                              {EMPLOYEE_STATUS[status].label}
                            </SelectItem>
                          ))}
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
                              const time = formatShiftTime(selected);
                              return time === '—'
                                ? selected.name
                                : `${selected.name} (${time})`;
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
                              {item.name}
                              {formatShiftTime(item) !== '—' &&
                                ` (${formatShiftTime(item)})`}
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
                        min={15}
                        max={60}
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
                          aria-pressed={!!isDelivered}
                          className={`flex h-10 items-center justify-between gap-2 rounded-md border px-3 text-left transition-all sm:h-9 ${
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
            </fieldset>
          </Tabs>

          <DialogFooter className="bg-muted/20 shrink-0 gap-2 border-t px-6 py-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
            >
              {readOnly ? 'Fechar' : 'Cancelar'}
            </Button>
            {!readOnly && (
              <Button
                type="submit"
                disabled={isSubmitting || uploadingAvatar}
                className="rounded-md"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
