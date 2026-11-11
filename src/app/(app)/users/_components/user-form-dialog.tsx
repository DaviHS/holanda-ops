'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, type RouterOutputs } from '@/trpc/react';
import { userSchema } from '@/validators/user';
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

type User = RouterOutputs['user']['list'][number];

const createUserFormSchema = userSchema.extend({
  employeeId: z.string().min(1, 'Selecione um funcionário'),
});

const updateUserFormSchema = userSchema.extend({
  employeeId: z.string().min(1, 'Selecione um funcionário'),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .or(z.literal(''))
    .optional(),
});

export type UserFormValues =
  z.input<typeof createUserFormSchema> | z.input<typeof updateUserFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: User | null;
  onSubmit: (data: UserFormValues) => Promise<void>;
}

export function UserFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: UserFormDialogProps) {
  const isEditing = !!editing;

  const { data: roles = [] } = api.role.list.useQuery();
  const { data: employees = [] } = api.employee.list.useQuery();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(
      isEditing ? updateUserFormSchema : createUserFormSchema,
    ),
    defaultValues: {
      email: '',
      password: '',
      status: 'active',
      roleId: '',
      employeeId: '',
    },
  });

  useEffect(() => {
    if (editing) {
      reset({
        email: editing.email,
        password: '',
        status: editing.status,
        roleId: editing.roleId,
        employeeId: editing.employee?.id ?? '',
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
  }, [editing, reset, open, roles]);

  const handleFormSubmit = async (data: UserFormValues) => {
    const actionPromise = onSubmit(data);

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
            <UserPlus className="text-muted-foreground size-5" />
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col"
        >
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="employeeId" className="text-xs font-medium">
                Funcionário <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="employeeId"
                render={({ field }) => {
                  const selectedEmp = employees.find(
                    (e) => e.id === field.value,
                  );
                  return (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(val) => val && field.onChange(val)}
                      disabled={isEditing}
                    >
                      <SelectTrigger className="mt-1 !h-10 w-full rounded-md text-sm">
                        <SelectValue placeholder="Selecione um funcionário...">
                          {selectedEmp?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-md">
                        {employees.map((emp) => (
                          <SelectItem
                            key={emp.id}
                            value={emp.id}
                            className="rounded-none py-2 text-sm"
                          >
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.employeeId && (
                <p className="text-destructive mt-1 text-[11px]">
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
                className="!h-10 w-full rounded-md text-sm"
              />
              {errors.email && (
                <p className="text-destructive mt-1 text-[11px]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                {isEditing
                  ? 'Nova Senha (deixe em branco para manter)'
                  : 'Senha de Acesso'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="!h-10 w-full rounded-md text-sm"
              />
              {errors.password && (
                <p className="text-destructive mt-1 text-[11px]">
                  {errors.password.message}
                </p>
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
                      <SelectTrigger className="mt-1 !h-10 w-full rounded-md text-sm">
                        <SelectValue placeholder="Selecione um perfil...">
                          {selectedRole?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-md">
                        {roles.map((role) => (
                          <SelectItem
                            key={role.id}
                            value={role.id}
                            className="rounded-none py-2 text-sm"
                          >
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.roleId && (
                <p className="text-destructive mt-1 text-[11px]">
                  {errors.roleId.message}
                </p>
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
                    onValueChange={(val) => val && field.onChange(val)}
                  >
                    <SelectTrigger className="mt-1 !h-10 w-full rounded-md text-sm">
                      <SelectValue placeholder="Selecione">
                        {field.value === 'inactive'
                          ? 'Inativo'
                          : field.value === 'suspended'
                            ? 'Suspenso'
                            : 'Ativo'}
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
                      <SelectItem
                        value="suspended"
                        className="rounded-none py-2 text-sm"
                      >
                        Suspenso
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-destructive mt-1 text-[11px]">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="bg-muted/20 shrink-0 gap-2 border-t px-6 py-3 sm:gap-0">
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
              {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
