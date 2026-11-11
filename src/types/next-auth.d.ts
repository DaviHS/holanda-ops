import { type DefaultSession } from 'next-auth';

type UserStatus = 'active' | 'inactive' | 'suspended';

declare module 'next-auth' {
  interface User {
    id?: string;
    roleId?: string;
    status?: UserStatus;
    employeeId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      roleId: string;
      status: UserStatus;
      employeeId?: string | null;
    } & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    roleId?: string;
    status?: UserStatus;
    employeeId?: string | null;
  }
}
