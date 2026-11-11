'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { Loader2, UserPlus } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import { userSchema, userStatuses } from '@/validators/user';
import { usePermissions } from '@/hooks/use-permissions';
import { userStatusLabel } from '@/lib/user-status';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/password-input';

type User = RouterOutputs['user']['list'][number];

const formSchema = userSchema.extend({
  employeeId: z.string().min(1, 'Selecione um funcionário'),
  roleId: z.string().min(1, 'Selecione um cargo'),
});

export type UserFormValues = z.input<typeof formSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: User | null;
  onSubmit: (data: UserFormValues) => Promise<void>;
}

const fieldClass = ' w-full rounded-md text-sm';
const errorClass = 'text-destructive mt-1 text-[11px]';

export function UserFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: UserFormDialogProps) {
  const isEditing = !!editing;
  const { data: session } = useSession();
  const { isAdmin: actorIsAdmin } = usePermissions();
  // Na própria conta não dá para mudar status, cargo nem nível de administrador.
  const isSelf = !!editing && editing.id === session?.user?.id;

  const { data: roles = [] } = api.role.list.useQuery();
  const { data: allEmployees = [] } = api.employee.list.useQuery();
  // Ao criar, só aparecem funcionários que ainda não têm acesso.
  const employees = allEmployees.filter(
    (emp) => !emp.userId || emp.id === editing?.employee?.id,
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      status: 'active',
      roleId: '',
      employeeId: '',
      isAdmin: false,
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
        isAdmin: editing.isAdmin,
      });
    } else {
      reset({
        email: '',
        password: '',
        status: 'active',
        roleId: '',
        employeeId: '',
        isAdmin: false,
      });
    }
  }, [editing, reset, open]);

  const handleFormSubmit = async (data: UserFormValues) => {
    try {
      await onSubmit(data);
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
          <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
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
                      <SelectTrigger
                        id="employeeId"
                        className={`mt-1 ${fieldClass}`}
                      >
                        <SelectValue placeholder="Selecione um funcionário...">
                          {selectedEmp?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-md">
                        {employees.length === 0 && (
                          <p className="text-muted-foreground px-2 py-3 text-center text-xs">
                            Todos os funcionários já têm acesso.
                          </p>
                        )}
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
                <p className={errorClass}>{errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                E-mail de Acesso <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="usuario@email.com"
                {...register('email')}
                className={fieldClass}
              />
              {errors.email && (
                <p className={errorClass}>{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                {isEditing
                  ? 'Nova Senha (opcional)'
                  : 'Senha de Acesso (opcional)'}
              </Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('password')}
                className={fieldClass}
              />
              <p className="text-muted-foreground text-[11px]">
                {isEditing
                  ? 'Deixe em branco para manter a atual. Prefira "Enviar link de senha" no menu da lista.'
                  : 'Deixe em branco para o usuário receber um link por e-mail e criar a própria senha.'}
              </p>
              {errors.password && (
                <p className={errorClass}>{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roleId" className="text-xs font-medium">
                Cargo <span className="text-destructive">*</span>
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
                      disabled={isSelf}
                    >
                      <SelectTrigger
                        id="roleId"
                        className={`mt-1 ${fieldClass}`}
                      >
                        <SelectValue placeholder="Selecione um cargo...">
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
                <p className={errorClass}>{errors.roleId.message}</p>
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
                    disabled={isSelf}
                  >
                    <SelectTrigger id="status" className={`mt-1 ${fieldClass}`}>
                      <SelectValue placeholder="Selecione">
                        {userStatusLabel(field.value ?? 'active')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-md">
                      {userStatuses.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="rounded-none py-2 text-sm"
                        >
                          {userStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className={errorClass}>{errors.status.message}</p>
              )}
            </div>

            {actorIsAdmin && (
              <Controller
                control={control}
                name="isAdmin"
                render={({ field }) => (
                  <div className="flex items-start gap-3 rounded-md border p-3">
                    <Checkbox
                      id="isAdmin"
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      disabled={isSelf}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor="isAdmin" className="text-sm font-medium">
                        Administrador
                      </Label>
                      <p className="text-muted-foreground text-[11px]">
                        Acesso total ao sistema, independente das permissões do
                        cargo.
                      </p>
                    </div>
                  </div>
                )}
              />
            )}

            {isSelf && (
              <p className="text-muted-foreground text-[11px]">
                Na sua própria conta não é possível alterar status, cargo nem o
                nível de administrador.
              </p>
            )}
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
              {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
