'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Activity,
  Users,
  Layers,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail')
    .email('Endereço de e-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInValues) => {
    setAuthError(null);

    const loginPromise = async () => {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Credenciais inválidas ou conta inativa.');
      }

      router.push('/');
      router.refresh();
      return result;
    };

    void toast.promise(loginPromise(), {
      loading: 'Autenticando...',
      success: 'Login realizado com sucesso!',
      error: (err: { message?: string }) => {
        const message =
          err.message || 'Ocorreu um erro ao tentar realizar o login.';
        setAuthError(message);
        return message;
      },
    });
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-zinc-800 bg-zinc-950 p-12 text-white lg:flex">
        <div className="from-primary/15 absolute inset-0 bg-gradient-to-tr via-transparent to-transparent opacity-60" />
        <div className="bg-primary/10 absolute -bottom-20 -left-20 size-96 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="shadow-primary/10 relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-800 shadow-lg">
            <Image
              src="/android-chrome-192x192.png"
              alt="Logo Holanda Ops"
              width={36}
              height={36}
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight">Holanda OPS</span>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="bg-primary/10 border-primary/20 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <Activity className="size-3.5" />
            <span>Controle e Operação em Tempo Real</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
              Acelere sua gestão operacional com precisão.
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Centralize o controle de equipes, escalas e setores em uma única
              plataforma intuitiva e de alta performance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-2">
                <Users className="text-primary size-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">Gestão de Pessoas</p>
                <p className="text-zinc-500">Escalas e setores</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-2">
                <Layers className="text-primary size-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">Acessos Nativos</p>
                <p className="text-zinc-500">Permissões por perfil</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-zinc-800/80 pt-6 text-xs text-zinc-500">
          <span>&copy; {new Date().getFullYear()} Holanda OPS</span>
          <span className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
            Servidores Operacionais
          </span>
        </div>
      </div>

      <div className="bg-background flex flex-col justify-between p-6 sm:p-10 lg:p-12">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="border-border relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border shadow-xs">
              <Image
                src="/android-chrome-192x192.png"
                alt="Logo Holanda Ops"
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </div>
            <span className="text-base font-bold tracking-tight">
              Holanda OPS
            </span>
          </div>
        </div>

        <div className="mx-auto my-auto w-full max-w-sm space-y-6 py-8">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Acessar Conta
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Digite seu e-mail e senha para entrar no sistema
            </p>
          </div>

          {authError && (
            <Alert variant="destructive" className="py-2.5">
              <AlertDescription className="text-xs font-medium">
                {authError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                E-mail Profissional
              </Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  autoComplete="email"
                  className="!h-10 rounded-md pl-9 text-sm"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-[11px] font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">
                  Senha
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-primary text-xs font-medium hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="!h-10 rounded-md pr-9 pl-9 text-sm"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-[11px] font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="!h-10 w-full rounded-md text-sm font-medium shadow-sm transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar no Painel'
              )}
            </Button>
          </form>
        </div>

        <div className="text-muted-foreground text-center text-xs lg:hidden">
          &copy; {new Date().getFullYear()} Holanda OPS. Todos os direitos
          reservados.
        </div>
      </div>
    </div>
  );
}
