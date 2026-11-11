import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export function NoAccess() {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="Você não tem acesso a esta página"
      description="Peça a um administrador para liberar a permissão necessária para o seu cargo."
    />
  );
}
