'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  PERMISSIONS,
  PERMISSION_GROUPS,
  type Permission,
} from '@/lib/permissions';

export function PermissionChecklist({
  value,
  onChange,
}: {
  value: Set<Permission>;
  onChange: (next: Set<Permission>) => void;
}) {
  const toggle = (permission: Permission, checked: boolean) => {
    const next = new Set(value);
    if (checked) next.add(permission);
    else next.delete(permission);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">
          {value.size} de {PERMISSIONS.length} selecionadas
        </span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(new Set(PERMISSIONS))}
            disabled={value.size === PERMISSIONS.length}
          >
            Marcar todas
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(new Set())}
            disabled={value.size === 0}
          >
            Limpar
          </Button>
        </div>
      </div>
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.title} className="space-y-1.5">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {group.title}
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {group.items.map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-3 rounded-md border p-2.5 text-sm"
              >
                <Checkbox
                  checked={value.has(item.key)}
                  onCheckedChange={(checked) =>
                    toggle(item.key, checked === true)
                  }
                />
                <span className="min-w-0">
                  <span className="block font-medium">{item.label}</span>
                  <span className="text-muted-foreground block text-xs">
                    {item.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
