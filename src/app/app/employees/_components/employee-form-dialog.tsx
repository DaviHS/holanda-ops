'use client';

import { useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Briefcase, Shirt, CheckCircle2, Clock, MapPin, PackageCheck, Loader2 } from 'lucide-react';
import { type Employee } from '@/db/schema/employees';
import { insertEmployeeSchema } from '@/db/schema/employees';
import { z } from 'zod';

export type EmployeeFormValues = z.infer<typeof insertEmployeeSchema>;

type EmployeeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSubmit: (data: EmployeeFormValues) => void;
  isSubmitting?: boolean;
};

const SECTORS = ['Grajaú', 'Centro', 'Zona Sul', 'Logística', 'Administrativo', 'Operacional'];
const WORK_SCHEDULES = [
  { label: '08:00 - 17:00 (Comercial)', entry: '08:00', exit: '17:00' },
  { label: '07:00 - 16:00 (Manhã)', entry: '07:00', exit: '16:00' },
  { label: '12:00 - 21:00 (Tarde)', entry: '12:00', exit: '21:00' },
  { label: '22:00 - 06:00 (Noturno)', entry: '22:00', exit: '06:00' },
  { label: '12x36 (Escala)', entry: '07:00', exit: '19:00' },
];

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  onSubmit,
  isSubmitting = false,
}: EmployeeFormDialogProps) {
  const isEditing = !!employee;

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
      sector: '',
      shift: 'day',
      status: 'active',
      entryTime: '08:00',
      exitTime: '17:00',
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
        sector: employee.sector,
        shift: employee.shift,
        status: employee.status,
        entryTime: employee.entryTime,
        exitTime: employee.exitTime,
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
        sector: '',
        shift: 'day',
        entryTime: '08:00',
        exitTime: '17:00',
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
    onSubmit(payload);
  };

  const currentUniforms = watch('uniform');
  const currentEntry = watch('entryTime');
  const currentExit = watch('exitTime');
  const currentShift = watch('shift');
  const currentStatus = watch('status');

  const toggleUniformItem = (key: keyof NonNullable<EmployeeFormValues['uniform']>) => {
    setValue(`uniform.${key}`, !currentUniforms?.[key]);
  };

  const handleScheduleChange = (value: string | null) => {
    if (!value) return;
    const selected = WORK_SCHEDULES.find((s) => s.label === value);
    if (selected) {
      setValue('entryTime', selected.entry);
      setValue('exitTime', selected.exit);
    }
  };

  const selectedScheduleValue =
    WORK_SCHEDULES.find((s) => s.entry === currentEntry && s.exit === currentExit)?.label || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] flex flex-col gap-0 p-0 overflow-hidden max-h-[88vh] rounded-sm">
        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {isEditing ? 'Editar Colaborador' : 'Cadastrar Colaborador'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit, (err) => console.log('Validation Errors:', err))} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <Tabs defaultValue="pessoais" className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="px-6 py-3 bg-muted/40 border-b shrink-0">
              <TabsList className="w-full grid grid-cols-3 h-10 p-1 bg-muted/80 rounded-sm">
                <TabsTrigger value="pessoais" className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-sm">
                  <User className="size-3.5 shrink-0" />
                  <span className="truncate">Pessoais</span>
                </TabsTrigger>
                <TabsTrigger value="operacional" className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-sm">
                  <Briefcase className="size-3.5 shrink-0" />
                  <span className="truncate">Alocação</span>
                </TabsTrigger>
                <TabsTrigger value="uniformes" className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-sm">
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
                    <Input {...register('name')} placeholder="Ex: João da Silva" className="mt-1 text-sm !h-10 w-full rounded-sm" />
                    {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name.message}</p>}
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <Label className="text-xs font-medium">CPF</Label>
                    <Input {...register('cpf')} placeholder="000.000.000-00" className="mt-1 font-mono text-sm !h-10 w-full rounded-sm" />
                    {errors.cpf && <p className="text-[11px] text-destructive mt-1">{errors.cpf.message}</p>}
                  </div>

                  <div className="col-span-12 sm:col-span-6">
                    <Label className="text-xs font-medium">RG</Label>
                    <Input {...register('rg')} placeholder="00.000.000-0" className="mt-1 font-mono text-sm !h-10 w-full rounded-sm" />
                  </div>

                  <div className="col-span-12">
                    <Label className="text-xs font-medium">Chave Pix</Label>
                    <Input {...register('pixKey')} placeholder="E-mail, CPF, telefone ou chave aleatória" className="mt-1 text-sm !h-10 w-full rounded-sm" />
                  </div>

                  <div className="col-span-12">
                    <Label className="text-xs font-medium">Endereço Residencial</Label>
                    <Input {...register('address')} placeholder="Rua, número, complemento e bairro" className="mt-1 text-sm !h-10 w-full rounded-sm" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="operacional" className="mt-0 space-y-4">
                <div className="p-4 rounded-sm border bg-card/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <MapPin className="size-3.5" />
                    <span>Lotação e Situação</span>
                  </div>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 sm:col-span-8">
                      <Label className="text-xs font-medium">Setor / Posto de Trabalho</Label>
                      <Select
                        value={watch('sector') || ''}
                        onValueChange={(val) => val && setValue('sector', val)}
                      >
                        <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-sm">
                          <SelectValue placeholder="Selecione o setor" />
                        </SelectTrigger>
                        <SelectContent className="rounded-sm">
                          {SECTORS.map((sector) => (
                            <SelectItem key={sector} value={sector} className="text-sm py-2 rounded-none">
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sector && <p className="text-[11px] text-destructive mt-1">{errors.sector.message}</p>}
                    </div>

                    <div className="col-span-12 sm:col-span-4">
                      <Label className="text-xs font-medium">Status do Contrato</Label>
                      <Select
                        value={currentStatus || 'active'}
                        onValueChange={(val) => val && setValue('status', val as 'active' | 'inactive')}
                      >
                        <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-sm">
                          <SelectValue placeholder="Selecione">
                            {currentStatus === 'inactive' ? 'Inativo' : 'Ativo'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-sm">
                          <SelectItem value="active" className="text-sm py-2 rounded-none">Ativo</SelectItem>
                          <SelectItem value="inactive" className="text-sm py-2 rounded-none">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-sm border bg-card/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Clock className="size-3.5" />
                    <span>Jornada de Trabalho</span>
                  </div>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 sm:col-span-4">
                      <Label className="text-xs font-medium">Turno</Label>
                      <Select
                        value={currentShift || 'day'}
                        onValueChange={(val) => val && setValue('shift', val as 'day' | 'night')}
                      >
                        <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-sm">
                          <SelectValue placeholder="Selecione">
                            {currentShift === 'night' ? 'Noturno' : 'Diurno'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-sm">
                          <SelectItem value="day" className="text-sm py-2 rounded-none">Diurno</SelectItem>
                          <SelectItem value="night" className="text-sm py-2 rounded-none">Noturno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-12 sm:col-span-8">
                      <Label className="text-xs font-medium">Horário da Jornada</Label>
                      <Select
                        value={selectedScheduleValue}
                        onValueChange={handleScheduleChange}
                      >
                        <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-sm">
                          <SelectValue placeholder="Selecione o horário da jornada" />
                        </SelectTrigger>
                        <SelectContent className="rounded-sm">
                          {WORK_SCHEDULES.map((item) => (
                            <SelectItem key={item.label} value={item.label} className="text-sm py-2 rounded-none">
                              {item.label}
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
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-sm border bg-card/50">
                    <div className="flex flex-col justify-start">
                      <Label className="text-xs font-medium h-4 flex items-center">Camisa</Label>
                      <Select
                        value={watch('shirtSize') || 'M'}
                        onValueChange={(val) => val && setValue('shirtSize', val as EmployeeFormValues['shirtSize'])}
                      >
                        <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-sm">
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                            <SelectItem key={size} value={size} className="text-sm py-1.5 rounded-none">{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col justify-start">
                      <Label className="text-xs font-medium h-4 flex items-center">Calça</Label>
                      <Input {...register('pantsSize')} placeholder="Ex: 42" className="mt-1 text-sm !h-10 w-full rounded-sm" />
                    </div>

                    <div className="flex flex-col justify-start">
                      <Label className="text-xs font-medium h-4 flex items-center">Calçado</Label>
                      <Input
                        type="number"
                        {...register('shoeSize', { valueAsNumber: true })}
                        placeholder="Ex: 40"
                        className="mt-1 text-sm font-mono !h-10 w-full rounded-sm"
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
                          className={`flex items-center justify-between px-3 !h-10 rounded-sm border text-left transition-all ${
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
              className="rounded-sm hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-sm">
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}