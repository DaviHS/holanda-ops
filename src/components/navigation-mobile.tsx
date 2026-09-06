import {
  BarChart3,
  Building2,
  CalendarDays,
  MoreHorizontal,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { icons } from '@/components/sidebar'
import { navGroups, type ModuleKey } from '@/components/data'
import { cn } from '@/lib/utils'

export function MobileNav({
  active,
  setActive,
  setOpen,
  setMore,
}: {
  active: ModuleKey
  setActive: (v: ModuleKey) => void
  setOpen: () => void
  setMore: () => void
}) {
  const items: [ModuleKey, string, any][] = [
    ['dashboard', 'Início', BarChart3],
    ['setores', 'Setores', Building2],
    ['funcionarios', 'Pessoas', Users],
    ['escalas', 'Escalas', CalendarDays],
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-[76px] items-center justify-around border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      {items.map(([key, label, Icon]) => (
        <button
          key={key}
          onClick={() => setActive(key)}
          className={cn(
            'flex min-w-14 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold',
            active === key ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Icon className="size-5" />
          {label}
        </button>
      ))}
      <button
        onClick={setMore}
        className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold text-muted-foreground"
      >
        <MoreHorizontal className="size-5" />
        Mais
      </button>
    </nav>
  )
}

export function MoreSheet({
  open,
  setOpen,
  setActive,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  setActive: (v: ModuleKey) => void
}) {
  const items = navGroups
    .flatMap((g) => g.items)
    .filter(
      ([key]) =>
        !['dashboard', 'visao', 'setores', 'funcionarios', 'escalas'].includes(
          key
        )
    )

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm transition sm:items-center sm:justify-center',
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full rounded-t-3xl border border-border bg-card p-5 transition-transform sm:max-w-md sm:rounded-3xl',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Mais módulos</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-muted-foreground"
          >
            <X />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {items.map(([key, label]) => {
            const Icon = icons[key] || Zap
            return (
              <button
                key={key}
                onClick={() => {
                  setActive(key as ModuleKey)
                  setOpen(false)
                }}
                className="flex min-h-14 items-center gap-3 rounded-xl bg-muted/60 px-3 text-left text-sm font-medium"
              >
                <Icon className="size-5 text-primary" />
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}