import { Badge } from '@/components/ui/badge';

type StatusBadgeProps = {
  status: 'active' | 'inactive' | 'suspended' | 'pending';
};

export function EmployeeStatusBadge({ status }: StatusBadgeProps) {
  const isChecked = status === 'active';

  return (
    <Badge
      variant={isChecked ? 'default' : 'destructive'}
      className={
        isChecked ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''
      }
    >
      {isChecked ? 'Ativo' : 'Inativo'}
    </Badge>
  );
}
