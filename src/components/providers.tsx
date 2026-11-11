'use client';

import type { PropsWithChildren } from 'react';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';

import { TRPCReactProvider } from '@/trpc/react';
import { ConfirmProvider } from '@/components/confirm-dialog';

export function Providers({ children }: PropsWithChildren) {
  return (
    <TRPCReactProvider>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConfirmProvider>{children}</ConfirmProvider>
        </ThemeProvider>
      </SessionProvider>
    </TRPCReactProvider>
  );
}
