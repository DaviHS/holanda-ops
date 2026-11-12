import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = { title: 'Meu perfil' };

export default function Layout({ children }: Readonly<PropsWithChildren>) {
  return children;
}
