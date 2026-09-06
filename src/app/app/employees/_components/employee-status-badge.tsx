import { Badge } from '@/components/ui/badge';

type StatusBadgeProps = {
  status: 'active' | 'inactive';
};

export function EmployeeStatusBadge({ status }: StatusBadgeProps) {
  const variant = status === 'active' ? 'success' : 'destructive';
  return <Badge variant={variant}>{status === 'active' ? 'Ativo' : 'Inativo'}</Badge>;
}