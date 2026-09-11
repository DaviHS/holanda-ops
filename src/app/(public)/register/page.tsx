'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, CreditCard, MapPin, Shirt, Footprints, Loader2, FileText, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/trpc/react';
import { 
  publicEmployeeRegisterSchema, 
  type PublicEmployeeRegisterValues, 
  shirtSizes 
} from '@/lib/validations/employee-register';

export default function EmployeeRegisterPage() {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const registerMutation = api.employees.publicRegister.useMutation();

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

  const onSubmit = (data: PublicEmployeeRegisterValues) => {
    const promise = registerMutation.mutateAsync(data);

    toast.promise(promise, {
      loading: 'Enviando pré-cadastro...',
      success: () => {
        reset();
        setIsSuccessOpen(true);
        return 'Pré-cadastro realizado com sucesso!';
      },
      error: (err) => {
        const message = err?.message || 'Tente novamente.';
        return `Erro ao realizar o pré-cadastro: ${message}`;
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950/5">
      <Card className="w-full max-w-lg shadow-lg border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-2">
            <User className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Pré-Cadastro de Funcionário</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Preencha seus dados pessoais e de vestuário. Setor, turno e cargo serão vinculados pela administração.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">Nome Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="name" placeholder="Seu nome completo" className="pl-9 text-sm rounded-md !h-10" {...register('name')} />
              </div>
              {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
            </div>

            {/* CPF e RG - 2 colunas de largura igual */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="cpf" className="text-xs font-medium">CPF *</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input id="cpf" placeholder="000.000.000-00" className="pl-9 text-sm rounded-md !h-10 w-full" {...register('cpf')} />
                </div>
                {errors.cpf && <p className="text-[11px] text-destructive">{errors.cpf.message}</p>}
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="rg" className="text-xs font-medium">RG</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input id="rg" placeholder="00.000.000-0" className="pl-9 text-sm rounded-md !h-10 w-full" {...register('rg')} />
                </div>
              </div>
            </div>

            {/* Chave PIX e Endereço - 2 colunas de largura igual */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="pixKey" className="text-xs font-medium">Chave PIX</Label>
                <Input id="pixKey" placeholder="CPF, E-mail ou Telefone" className="text-sm rounded-md !h-10 w-full" {...register('pixKey')} />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="address" className="text-xs font-medium">Endereço Residencial</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input id="address" placeholder="Rua, Nº, Bairro" className="pl-9 text-sm rounded-md !h-10 w-full" {...register('address')} />
                </div>
              </div>
            </div>

            {/* Informações de Roupa e Uniforme */}
            <div className="pt-2 border-t border-border space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tamanhos para Uniforme
              </Label>

              {/* 3 colunas dividindo o espaço igualmente (1/3 cada) */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-xs font-medium flex items-center gap-1 truncate">
                    <Shirt className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">Camiseta *</span>
                  </Label>
                  <Select defaultValue="M" onValueChange={(value) => setValue('shirtSize', value as any)}>
                    <SelectTrigger className="!h-10 text-sm rounded-md w-full">
                      <SelectValue placeholder="Tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      {shirtSizes.map((size) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label htmlFor="pantsSize" className="text-xs font-medium truncate block">Calça / Bermuda</Label>
                  <Input id="pantsSize" placeholder="Ex: 42" className="text-sm rounded-md !h-10 w-full" {...register('pantsSize')} />
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label htmlFor="shoeSize" className="text-xs font-medium flex items-center gap-1 truncate">
                    <Footprints className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">Calçado</span>
                  </Label>
                  <Input id="shoeSize" type="number" placeholder="Ex: 40" className="text-sm rounded-md !h-10 w-full" {...register('shoeSize')} />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              className="w-full !h-10 rounded-md font-medium text-sm mt-4"
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

      {/* Modal / Diálogo de Alerta de Sucesso */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="flex flex-col items-center justify-center pt-4">
            <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
              <CheckCircle2 className="size-6" />
            </div>
            <DialogTitle className="text-xl">Pré-cadastro Recebido!</DialogTitle>
            <DialogDescription className="text-sm pt-2">
              Seus dados foram enviados com sucesso. O setor administrativo revisará suas informações para concluir sua alocação de turno e setor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center pt-2">
            <Button onClick={() => setIsSuccessOpen(false)} className="px-6 rounded-md">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}