import NextAuth from 'next-auth';

import { authConfig } from './config';

// Instância sem provider/DB: segura para o proxy (sem importar `pg`).
export const { auth: authProxy } = NextAuth(authConfig);
