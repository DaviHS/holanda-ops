import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ShiftToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onNewClick: () => void;
};

export function ShiftToolbar({
  search,
  onSearchChange,
  onNewClick,
}: ShiftToolbarProps) {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar turno..."
          className="pl-10 rounded-md !h-10"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onNewClick} className="flex-1 sm:flex-none rounded-md h-10">
          <Plus className="mr-2 size-4" />
          <span>Novo</span>
        </Button>
      </div>
    </div>
  );
}