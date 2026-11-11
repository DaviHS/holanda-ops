import Link from 'next/link';
import { Key } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ResetPasswordForm } from './_components/reset-password-form';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const value = typeof token === 'string' ? token : '';

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="bg-primary/10 border-primary/20 mx-auto mb-2 flex size-12 items-center justify-center rounded-md border">
              <Key className="text-primary size-6" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Criar nova senha
            </CardTitle>
            <CardDescription>
              Escolha uma senha pessoal para voltar a acessar o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {value ? (
              <ResetPasswordForm token={value} />
            ) : (
              <p className="text-muted-foreground text-center text-sm">
                Link incompleto.{' '}
                <Link
                  href="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Peça um novo
                </Link>
                .
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-center text-sm">
            <Link href="/sign-in" className="text-primary hover:underline">
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
