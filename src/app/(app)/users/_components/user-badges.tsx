import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { USER_STATUS, type UserStatus } from '@/lib/user-status';

export function UserStatusBadge({ status }: { status: string }) {
  const config = USER_STATUS[status as UserStatus] ?? USER_STATUS.inactive;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const ADMIN_ROLE_NAMES = new Set(['admin', 'administrador']);

/** O selo some quando o próprio cargo já se chama admin/administrador (evita repetir). */
export function UserAdminBadge({
  isAdmin,
  roleName,
}: {
  isAdmin: boolean;
  roleName?: string | null;
}) {
  if (!isAdmin) return null;
  if (ADMIN_ROLE_NAMES.has((roleName ?? '').trim().toLowerCase())) return null;
  return (
    <Badge variant="outline" className="gap-1">
      <ShieldCheck />
      Administrador
    </Badge>
  );
}
