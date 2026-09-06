import { Bell, ChevronRight, Menu, Search } from 'lucide-react'
import { HolandaMark, UserAvatar } from '@/components/brand'
import { moduleLabels, type ModuleKey } from '@/components/data'
import { ThemeToggle, type Theme } from './theme-toggle'

export function Topbar({
  active,
  setOpen,
  setMore,
  theme,
  setTheme,
  query,
  setQuery,
  role = 'Administrador',
  setRole = () => {},
  selectedSector = 'Todos os setores',
  setSelectedSector = () => {},
}: {
  active: ModuleKey
  setOpen: () => void
  setMore: () => void
  theme: Theme
  setTheme: (t: Theme) => void
  query: string
  setQuery: (v: string) => void
  role?: string
  setRole?: (v: string) => void
  selectedSector?: string
  setSelectedSector?: (v: string) => void
}) {
  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl md:px-8">
      <button
        onClick={setOpen}
        className="flex size-11 items-center justify-center rounded-xl text-muted-foreground lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu />
      </button>
      <div className="lg:hidden">
        <HolandaMark compact className="text-primary" />
      </div>
      <select
        aria-label="Perfil operacional"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="hidden h-9 max-w-28 rounded-lg border border-border bg-card px-2 text-xs font-semibold sm:block"
      >
        <option>Administrador</option>
        <option>Gestor</option>
        <option>Supervisor</option>
        <option>Operacional</option>
      </select>
      <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
        <span>{role}</span>
        <ChevronRight className="size-3.5" />
        <select
          aria-label="Setor em contexto"
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="rounded-lg border border-border bg-card px-2 py-1 font-semibold text-foreground"
        >
          <option>Todos os setores</option>
          {[
            'Grajaú',
            'São Miguel',
            'Cidade Tiradentes',
            "M'Boi Mirim",
            'Condomínio Alpha',
            'Obra Central',
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <ChevronRight className="size-3.5" />
        <span>Workspace</span>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-foreground">
          {moduleLabels[active] || 'Dashboard'}
        </span>
      </div>
      <div className="relative ml-auto hidden w-full max-w-[390px] sm:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar funcionários, setores..."
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>
      <button
        aria-label="Notificações"
        className="relative flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
      >
        <Bell />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
      </button>
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <div className="hidden items-center gap-2 md:flex">
        <UserAvatar size="sm" />
        <span className="text-sm font-medium">Wagner</span>
      </div>
    </header>
  )
}