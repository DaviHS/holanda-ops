export type UserStatus = 'active' | 'inactive' | 'suspended';

export const USER_STATUS: Record<
  UserStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  active: { label: 'Ativo', variant: 'default' },
  inactive: { label: 'Inativo', variant: 'secondary' },
  suspended: { label: 'Suspenso', variant: 'destructive' },
};

export const userStatusLabel = (status: string) =>
  USER_STATUS[status as UserStatus]?.label ?? status;

export const userInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
