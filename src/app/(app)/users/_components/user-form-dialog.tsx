'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, type RouterOutputs } from '@/trpc/react';
import { insertUserSchema } from '@/server/db/schema/users';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/toast';

type User = RouterOutputs['users']['getAll'][number];

const createUserFormSchema = insertUserSchema.extend({
  employeeId: z.string().min(1, 'Selecione um funcionário'),
});

const updateUserFormSchema = insertUserSchema.extend({
  employeeId: z.string().min(1, 'Selecione um funcionário'),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .or(z.literal(''))
    .optional(),
});

export type UserFormValues = z.input<typeof createUserFormSchema> | z.input<typeof updateUserFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (data: UserFormValues) => Promise<void>;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserFormDialogProps) {
  const isEditing = !!user;

  const { data: roles = [] } = api.roles.getAll.useQuery();
  const { data: employees = [] } = api.employees.getAll.useQuery();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? updateUserFormSchema : createUserFormSchema),
    defaultValues: {
      email: '',
      password: '',
      status: 'active',
      roleId: '',
      employeeId: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        password: '',
        status: user.status,
        roleId: user.roleId,
        employeeId: user.employee?.id ?? '',
      });
    } else {
      reset({
        email: '',
        password: '',
        status: 'active',
        roleId: roles[0]?.id ?? '',
        employeeId: '',
      });
    }
  }, [user, reset, open, roles]);

  const handleFormSubmit = (data: UserFormValues) => {
    const actionPromise = onSubmit(data);

    toast.promise(actionPromise, {
      loading: isEditing ? 'Atualizando usuário...' : 'Criando usuário...',
      success: () => {
        onOpenChange(false);
        return isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!';
      },
      error: (err) => {
        const message = err?.message || 'Tente novamente.';
        return `Erro ao ${isEditing ? 'atualizar' : 'criar'} usuário: ${message}`;
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] flex flex-col gap-0 p-0 overflow-hidden rounded-md">
        <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="size-5 text-muted-foreground" />
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
          <div className="px-6 py-5 space-y-4">
            
            <div className="space-y-1.5">
              <Label htmlFor="employeeId" className="text-xs font-medium">
                Funcionário <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="employeeId"
                render={({ field }) => {
                  const selectedEmp = employees.find((e) => e.id === field.value);
                  return (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(val) => val && field.onChange(val)}
                      disabled={isEditing}
                    >
                      <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-md">
                        <SelectValue placeholder="Selecione um funcionário...">
                          {selectedEmp?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-md">
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id} className="text-sm py-2 rounded-none">
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.employeeId && (
                <p className="text-[11px] text-destructive mt-1">
                  {errors.employeeId.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                E-mail de Acesso <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                {...register('email')}
                className="text-sm !h-10 w-full rounded-md"
              />
              {errors.email && (
                <p className="text-[11px] text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="text-sm !h-10 w-full rounded-md"
              />
              {errors.password && (
                <p className="text-[11px] text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roleId" className="text-xs font-medium">
                Perfil de Acesso <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="roleId"
                render={({ field }) => {
                  const selectedRole = roles.find((r) => r.id === field.value);
                  return (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(val) => val && field.onChange(val)}
                    >
                      <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-md">
                        <SelectValue placeholder="Selecione um perfil...">
                          {selectedRole?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-md">
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id} className="text-sm py-2 rounded-none">
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.roleId && (
                <p className="text-[11px] text-destructive mt-1">{errors.roleId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-medium">
                Status da Conta
              </Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value || 'active'}
                    onValueChange={(val) => val && field.onChange(val as 'active' | 'inactive' | 'suspended')}
                  >
                    <SelectTrigger className="mt-1 text-sm !h-10 w-full rounded-md">
                      <SelectValue placeholder="Selecione">
                        {field.value === 'inactive'
                          ? 'Inativo'
                          : field.value === 'suspended'
                          ? 'Suspenso'
                          : 'Ativo'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-md">
                      <SelectItem value="active" className="text-sm py-2 rounded-none">
                        Ativo
                      </SelectItem>
                      <SelectItem value="inactive" className="text-sm py-2 rounded-none">
                        Inativo
                      </SelectItem>
                      <SelectItem value="suspended" className="text-sm py-2 rounded-none">
                        Suspenso
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-[11px] text-destructive mt-1">{errors.status.message}</p>
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
              {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}