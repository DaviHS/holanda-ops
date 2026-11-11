import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ForgotPasswordForm } from './_components/forgot-password-form';

export const metadata: Metadata = { title: 'Esqueci minha senha' };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="bg-primary/10 border-primary/20 mx-auto mb-2 flex size-12 items-center justify-center rounded-md border">
              <Mail className="text-primary size-6" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Esqueci minha senha
            </CardTitle>
            <CardDescription>
              Informe o e-mail do seu cadastro e enviaremos um link para criar
              uma nova senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
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
