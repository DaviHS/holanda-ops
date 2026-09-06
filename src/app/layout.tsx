import { Geist, Geist_Mono, Inter } from 'next/font/google'
import type { Viewport } from 'next'
import { cn } from "@/lib/utils";
import { SessionProvider } from 'next-auth/react';
import { TRPCReactProvider } from '@/trpc/react';
import { Providers } from '@/components/provider/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#F58220',
  userScalable: false,
};

export * from "./__metadata";

// @ts-expect-error CSS side-effect import
import '../styles/globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("bg-background", "font-sans", inter.variable)}>
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <TRPCReactProvider>
            <Providers>
              {children}
            </Providers>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}