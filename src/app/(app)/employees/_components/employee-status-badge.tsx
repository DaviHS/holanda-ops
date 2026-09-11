import { Badge } from '@/components/ui/badge';

type StatusBadgeProps = {
  status: 'active' | 'inactive' | 'suspended' | 'pending';
};

export function EmployeeStatusBadge({ status }: StatusBadgeProps) {
  const isChecked = status === 'active';

  return (
    <Badge
      variant={isChecked ? 'default' : 'destructive'}
      className={isChecked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
    >
      {isChecked ? 'Ativo' : 'Inativo'}
    </Badge>
  );
}