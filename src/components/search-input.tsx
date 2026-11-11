'use client';

import { Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  isLoading = false,
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={props['aria-label'] ?? placeholder}
        className="pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
        {isLoading ? (
          <Loader2 className="text-muted-foreground mr-2 size-4 animate-spin" />
        ) : (
          value !== '' && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded-sm"
              aria-label="Limpar busca"
            >
              <X className="size-3.5" />
            </button>
          )
        )}
      </div>
    </div>
  );
}
