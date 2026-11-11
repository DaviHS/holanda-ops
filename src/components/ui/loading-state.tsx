import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-8"
    >
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
      <p className="text-muted-foreground mt-2">{message}</p>
    </div>
  );
}
