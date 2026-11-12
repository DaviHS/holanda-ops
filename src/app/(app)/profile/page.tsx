'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2, UserRound } from 'lucide-react';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/ui/loading-state';
import { PageContainer, PageHeader } from '@/components/page-header';
import { PasswordInput } from '@/components/password-input';
import { formatDateTime } from '@/lib/formatters';
import { mutationFeedback } from '@/lib/mutation-feedback';
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from '@/validators/profile';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="truncate text-sm font-medium">{value || '—'}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading } = api.profile.get.useQuery();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const changePassword = api.profile.changePassword.useMutation(
    mutationFeedback({
      success: 'Senha alterada com sucesso!',
      error: 'Erro ao alterar a senha',
      onSuccess: () => form.reset(),
    }),
  );

  const onSubmit = ({
    currentPassword,
    newPassword,
  }: ChangePasswordFormValues) =>
    changePassword.mutateAsync({ currentPassword, newPassword }).catch(() => {
      // o aviso de erro já é exibido pelo toast da mutation
    });

  const errors = form.formState.errors;

  return (
    <PageContainer>
      <PageHeader
        title="Meu perfil"
        icon={UserRound}
        description="Seus dados de acesso e a troca de senha."
      />

      {isLoading || !profile ? (
        <LoadingState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Minha conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome" value={profile.name ?? ''} />
                <Field label="E-mail" value={profile.email} />
                <Field
                  label="Cargo"
                  value={
                    profile.isAdmin
                      ? `${profile.roleName} (administrador)`
                      : profile.roleName
                  }
                />
                <Field
                  label="Último acesso"
                  value={formatDateTime(profile.lastLoginAt)}
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <KeyRound className="text-muted-foreground size-4" />
                Alterar senha
              </CardTitle>
              <CardDescription>
                Você continua conectado neste aparelho depois de trocar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-xs">
                    Senha atual
                  </Label>
                  <PasswordInput
                    id="currentPassword"
                    autoComplete="current-password"
                    {...form.register('currentPassword')}
                  />
                  {errors.currentPassword && (
                    <p className="text-destructive text-[11px]">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs">
                    Nova senha
                  </Label>
                  <PasswordInput
                    id="newPassword"
                    autoComplete="new-password"
                    {...form.register('newPassword')}
                  />
                  {errors.newPassword && (
                    <p className="text-destructive text-[11px]">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs">
                    Confirmar nova senha
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    autoComplete="new-password"
                    {...form.register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-destructive text-[11px]">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Salvar nova senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
