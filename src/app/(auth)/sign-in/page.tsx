'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Lock, Mail, Activity, Users, Layers } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const signInSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('Endereço de e-mail inválido'),
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
    try {
      setAuthError(null);

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError('Credenciais inválidas ou conta inativa.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setAuthError('Ocorreu um erro ao tentar realizar o login.');
    }
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Painel Esquerdo (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden border-r border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent opacity-60" />
        <div className="absolute -left-20 -bottom-20 size-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 shadow-lg shadow-primary/10">
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

        <div className="relative z-10 space-y-6 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
            <Activity className="size-3.5" />
            <span>Controle e Operação em Tempo Real</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-balance leading-tight">
              Acelere sua gestão operacional com precisão.
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Centralize o controle de equipes, escalas e setores em uma única plataforma intuitiva e de alta performance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-zinc-900 border border-zinc-800">
                <Users className="size-4 text-primary" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">Gestão de Pessoas</p>
                <p className="text-zinc-500">Escalas e setores</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-zinc-900 border border-zinc-800">
                <Layers className="size-4 text-primary" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">Acessos Nativos</p>
                <p className="text-zinc-500">Permissões por perfil</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/80 pt-6">
          <span>&copy; {new Date().getFullYear()} Holanda OPS</span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Servidores Operacionais
          </span>
        </div>
      </div>

      {/* Form de Login */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-background">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border shadow-xs">
              <Image
                src="/android-chrome-192x192.png"
                alt="Logo Holanda Ops"
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </div>
            <span className="text-base font-bold tracking-tight">Holanda OPS</span>
          </div>
        </div>

        <div className="mx-auto my-auto w-full max-w-sm space-y-6 py-8">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Acessar Conta</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  autoComplete="email"
                  className="pl-9 text-sm !h-10 rounded-md"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive font-medium">
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
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-9 pr-9 text-sm !h-10 rounded-md"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                <p className="text-[11px] text-destructive font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full !h-10 rounded-md font-medium text-sm transition-all shadow-sm"
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

        <div className="text-center text-xs text-muted-foreground lg:hidden">
          &copy; {new Date().getFullYear()} Holanda OPS. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}