'use client';

import { api } from '@/trpc/react';
import type { Permission } from '@/lib/permissions';

export function usePermissions() {
  const { data, isPending } = api.access.me.useQuery(undefined, {
    staleTime: 60_000,
  });
  const granted = new Set<string>(data?.permissions);

  return {
    isLoading: isPending,
    isAdmin: data?.isAdmin ?? false,

    can: (...permissions: Permission[]) =>
      permissions.length === 0 ||
      permissions.some((permission) => granted.has(permission)),
  };
}

export type CanFn = ReturnType<typeof usePermissions>['can'];
