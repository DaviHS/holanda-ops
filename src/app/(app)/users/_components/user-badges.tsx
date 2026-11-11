import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { USER_STATUS, type UserStatus } from '@/lib/user-status';

export function UserStatusBadge({ status }: { status: string }) {
  const config = USER_STATUS[status as UserStatus] ?? USER_STATUS.inactive;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function UserAdminBadge({ isAdmin }: { isAdmin: boolean }) {
  if (!isAdmin) return null;
  return (
    <Badge variant="outline" className="gap-1">
      <ShieldCheck />
      Administrador
    </Badge>
  );
}
