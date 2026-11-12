'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  CreditCard,
  MapPin,
  Shirt,
  Footprints,
  Loader2,
  FileText,
  CheckCircle2,
} from 'lucide-react';

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { errorMessage, toastError } from '@/lib/toast';
import { formatCpf } from '@/lib/formatters/cpf';
import { api } from '@/trpc/react';
import {
  publicEmployeeRegisterSchema,
  type PublicEmployeeRegisterValues,
  shirtSizes,
} from '@/validators/register';

export default function EmployeeRegisterPage() {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const registerMutation = api.employee.publicRegister.useMutation();

  const [openedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PublicEmployeeRegisterValues>({
    resolver: zodResolver(publicEmployeeRegisterSchema),
    defaultValues: {
      name: '',
      cpf: '',
      rg: '',
      pixKey: '',
      address: '',
      shirtSize: 'M',
      pantsSize: '',
    },
  });

  const onSubmit = async (data: PublicEmployeeRegisterValues) => {
    const toastId = toast.loading('Enviando pré-cadastro...');
    try {
      await registerMutation.mutateAsync({
        ...data,
        openedAt,
      });
      toast.success('Pré-cadastro realizado com sucesso!', { id: toastId });
      reset();
      setIsSuccessOpen(true);
    } catch (cause) {
      toastError(
        errorMessage('Erro ao realizar o pré-cadastro', {
          message: cause instanceof Error ? cause.message : 'Tente novamente.',
        }),
        { id: toastId },
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950/5 p-4">
      <Card className="border-border w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="bg-primary/10 border-primary/20 mx-auto mb-2 flex size-12 items-center justify-center rounded-md border">
            <User className="text-primary size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Pré-Cadastro de Funcionário
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Preencha seus dados pessoais e de vestuário. Setor, turno e cargo
            serão vinculados pela administração.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Nome Completo *
              </Label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  className="rounded-md pl-9 text-sm"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-destructive text-[11px]">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="cpf" className="text-xs font-medium">
                  CPF *
                </Label>
                <div className="relative">
                  <CreditCard className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    className="w-full rounded-md pl-9 text-sm"
                    inputMode="numeric"
                    maxLength={14}
                    {...register('cpf', {
                      onChange: (
                        event: React.ChangeEvent<HTMLInputElement>,
                      ) => {
                        event.target.value = formatCpf(event.target.value);
                      },
                    })}
                  />
                </div>
                {errors.cpf && (
                  <p className="text-destructive text-[11px]">
                    {errors.cpf.message}
                  </p>
                )}
              </div>

              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="rg" className="text-xs font-medium">
                  RG
                </Label>
                <div className="relative">
                  <FileText className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="rg"
                    placeholder="00.000.000-0"
                    className="w-full rounded-md pl-9 text-sm"
                    {...register('rg')}
                  />
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="pixKey" className="text-xs font-medium">
                  Chave PIX
                </Label>
                <Input
                  id="pixKey"
                  placeholder="CPF, E-mail ou Telefone"
                  className="w-full rounded-md text-sm"
                  {...register('pixKey')}
                />
              </div>

              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="address" className="text-xs font-medium">
                  Endereço Residencial
                </Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="address"
                    placeholder="Rua, Nº, Bairro"
                    className="w-full rounded-md pl-9 text-sm"
                    {...register('address')}
                  />
                </div>
              </div>
            </div>

            <div className="border-border space-y-3 border-t pt-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Tamanhos para Uniforme
              </Label>

              <div className="grid w-full grid-cols-3 gap-3">
                <div className="min-w-0 space-y-1.5">
                  <Label className="flex items-center gap-1 truncate text-xs font-medium">
                    <Shirt className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="truncate">Camiseta *</span>
                  </Label>
                  <Select
                    defaultValue="M"
                    onValueChange={(value) =>
                      setValue(
                        'shirtSize',
                        value as (typeof shirtSizes)[number],
                      )
                    }
                  >
                    <SelectTrigger className="w-full rounded-md text-sm">
                      <SelectValue placeholder="Tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      {shirtSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label
                    htmlFor="pantsSize"
                    className="block truncate text-xs font-medium"
                  >
                    Calça / Bermuda
                  </Label>
                  <Input
                    id="pantsSize"
                    placeholder="Ex: 42"
                    className="w-full rounded-md text-sm"
                    {...register('pantsSize')}
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label
                    htmlFor="shoeSize"
                    className="flex items-center gap-1 truncate text-xs font-medium"
                  >
                    <Footprints className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="truncate">Calçado</span>
                  </Label>
                  <Input
                    id="shoeSize"
                    type="number"
                    placeholder="Ex: 40"
                    className="w-full rounded-md text-sm"
                    {...register('shoeSize', {
                      setValueAs: (v: string) =>
                        v === '' ? undefined : Number(v),
                    })}
                  />
                </div>
              </div>
            </div>

            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute -left-[9999px] size-0 opacity-0"
              {...register('website')}
            />

            <Button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              className="mt-4 w-full rounded-md text-sm font-medium"
            >
              {isSubmitting || registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Enviando pré-cadastro...
                </>
              ) : (
                'Enviar Pré-Cadastro'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="text-center sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center pt-4">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-6" />
            </div>
            <DialogTitle className="text-xl">
              Pré-cadastro Recebido!
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              Seus dados foram enviados com sucesso. O setor administrativo
              revisará suas informações para concluir sua alocação de turno e
              setor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 sm:justify-center">
            <Button
              onClick={() => setIsSuccessOpen(false)}
              className="rounded-md px-6"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
