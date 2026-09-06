import {
  AlertCircle,
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Package,
  Settings,
  Shirt,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { HolandaMark, UserAvatar } from '@/components/brand'
import { navGroups, type ModuleKey } from '@/components/data'
import { cn } from '@/lib/utils'

export const icons: Record<string, any> = {
  dashboard: BarChart3,
  visao: Zap,
  setores: Building2,
  funcionarios: Users,
  cargos: Users,
  escalas: CalendarDays,
  frequencia: ClipboardCheck,
  atestados: FileCheck2,
  uniformes: Shirt,
  estoque: Package,
  contratos: FileText,
  ocorrencias: AlertCircle,
  relatorios: BarChart3,
  usuarios: Users,
  configuracoes: Settings,
}

export function Sidebar({
  active,
  setActive,
  open,
  setOpen,
}: {
  active: ModuleKey
  setActive: (v: ModuleKey) => void
  open: boolean
  setOpen: (v: boolean) => void
}) {
  return (
    <>
      <button
        aria-label="Fechar menu"
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-30 bg-background/70 backdrop-blur-sm transition lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-20 items-center border-b border-sidebar-border px-5">
          <HolandaMark className="text-primary" />
          <button
            onClick={() => setOpen(false)}
            className="ml-auto rounded-lg p-2 text-muted-foreground lg:hidden"
            aria-label="Fechar"
          >
            <X />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <div className="mb-2 px-3 text-[10px] font-bold tracking-[.18em] text-muted-foreground/60">
                {group.label}
              </div>
              <div className="flex flex-col gap-1">
                {group.items.map(([key, label]) => {
                  const Icon = icons[key!] || Zap
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActive(key as ModuleKey)
                        setOpen(false)
                      }}
                      className={cn(
                        'flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition',
                        active === key
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                      )}
                    >
                      <Icon className="size-[18px]" />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <UserAvatar size="sm" />
            <div>
              <p className="text-sm font-semibold text-foreground">Wagner</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}