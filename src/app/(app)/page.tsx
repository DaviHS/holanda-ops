'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Moon,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Shirt,
  Sun,
  UserRoundCheck,
  UserRoundX,
  Users,
  X,
  Zap,
} from 'lucide-react'

import { UserAvatar } from '@/components/brand'
import {
  alerts,
  attestations as seedAttestations,
  contracts as seedContracts,
  employees as seedEmployees,
  frequencies as seedFrequencies,
  getModuleMeta,
  inventory as seedInventory,
  moduleLabels,
  navGroups,
  occurrences as seedOccurrences,
  reports,
  roles,
  sectors as seedSectors,
  statusTone,
  tableColumns,
  todayOperation,
  uniforms as seedUniforms,
  users,
  type ModuleKey,
} from '@/components/data'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'
type Employee = (typeof seedEmployees)[number]
type Modal = 'none' | 'employee' | 'sector' | 'occurrence' | 'stock' | 'attestation'

function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        tone === 'success' && 'bg-emerald-500/10 text-emerald-500',
        tone === 'warning' && 'bg-amber-500/10 text-amber-400',
        tone === 'danger' && 'bg-rose-500/10 text-rose-400',
        tone === 'info' && 'bg-sky-500/10 text-sky-400',
        tone === 'neutral' && 'bg-muted text-muted-foreground'
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

function Panel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-md border border-border/70 bg-card shadow-sm',
        className
      )}
    >
      {children}
    </section>
  )
}

function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: Theme
  setTheme: (t: Theme) => void
}) {
  return (
    <button
      aria-label="Alternar tema"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-primary"
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}

function MobileNav({
  active,
  setActive,
  setMore,
}: {
  active: ModuleKey
  setActive: (v: ModuleKey) => void
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

function MoreSheet({
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
          key!
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
          {items.map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setActive(key as ModuleKey)
                setOpen(false)
              }}
              className="flex min-h-14 items-center gap-3 rounded-xl bg-muted/60 px-3 text-left text-sm font-medium"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  caption,
  icon: Icon,
  tone = 'orange',
}: {
  label: string
  value: string | number
  caption: string
  icon: any
  tone?: string
}) {
  return (
    <Panel className="p-4">
      <div
        className={cn(
          'mb-4 flex size-10 items-center justify-center rounded-xl',
          tone === 'red'
            ? 'bg-rose-500/10 text-rose-400'
            : 'bg-primary/10 text-primary'
        )}
      >
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground">{caption}</span>
      </div>
    </Panel>
  )
}

function Dashboard({
  go,
  employees,
  sectors,
  attestations,
  contracts,
  uniforms,
}: {
  go: (v: ModuleKey) => void
  employees: Employee[]
  sectors: any[]
  attestations: any[]
  inventory: any[]
  contracts: any[]
  uniforms: any[]
}) {
  const active = employees.filter((e) => e.status === 'Ativo').length
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
          <Zap className="size-3.5" />
          24 de agosto de 2026
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Visão operacional
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe sua operação em um único lugar.
        </p>
      </div>
      <section>
        <h2 className="mb-3 text-base font-bold">Resumo</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Kpi
            label="Funcionários"
            value={employees.length}
            caption="Ativos"
            icon={Users}
          />
          <Kpi
            label="Setores"
            value={sectors.length}
            caption="Operação"
            icon={Building2}
          />
          <Kpi
            label="Presentes"
            value={active}
            caption="90,5%"
            icon={UserRoundCheck}
          />
          <Kpi
            label="Ausentes"
            value={employees.length - active}
            caption="Hoje"
            icon={UserRoundX}
            tone="red"
          />
          <Kpi
            label="Atestados"
            value={attestations.length}
            caption="Andamento"
            icon={FileCheck2}
          />
          <Kpi
            label="Contratos"
            value={contracts.length}
            caption="Ativos"
            icon={FileText}
          />
          <Kpi
            label="Uniformes"
            value={uniforms.filter((x) => x.pending !== '—').length}
            caption="Pendências"
            icon={Shirt}
          />
          <Kpi
            label="Alertas"
            value={alerts.length}
            caption="Atenção"
            icon={Bell}
          />
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-base font-bold">Ações rápidas</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <Quick
            label="Funcionário"
            icon={Users}
            onClick={() => go('funcionarios')}
          />
          <Quick
            label="Registrar falta"
            icon={UserRoundX}
            onClick={() => go('frequencia')}
          />
          <Quick
            label="Atestado"
            icon={FileCheck2}
            onClick={() => go('atestados')}
          />
          <Quick
            label="Estoque"
            icon={Package}
            onClick={() => go('estoque')}
          />
          <Quick
            label="Ver escala"
            icon={CalendarDays}
            onClick={() => go('escalas')}
          />
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 p-4 md:p-5">
            <div>
              <h2 className="font-bold">Operação de hoje</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Presença por setor
              </p>
            </div>
            <button
              onClick={() => go('frequencia')}
              className="text-xs font-semibold text-primary"
            >
              Ver frequência
            </button>
          </div>
          <div className="divide-y divide-border/50">
            {todayOperation.map((row) => (
              <div key={row.sector} className="flex items-center gap-3 p-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{row.sector}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.present} de {row.team} presentes
                  </p>
                </div>
                <div className="hidden w-24 sm:block">
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(row.present / row.team) * 100}%` }}
                    />
                  </div>
                </div>
                <Badge tone={statusTone(row.status)}>{row.status}</Badge>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="border-b border-border/60 p-4 md:p-5">
            <h2 className="font-bold">Atenção necessária</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Itens que pedem acompanhamento
            </p>
          </div>
          <div className="flex flex-col divide-y divide-border/50">
            {alerts.slice(0, 4).map((a, i) => (
              <button
                key={i}
                onClick={() =>
                  go(
                    a.detail.includes('Estoque')
                      ? 'estoque'
                      : a.detail.includes('Atestado')
                      ? 'atestados'
                      : 'funcionarios'
                  )
                }
                className="flex min-h-14 items-center gap-3 p-4 text-left hover:bg-muted/30"
              >
                <span className="size-2 rounded-full bg-primary" />
                <span className="flex-1 text-sm">{a.title}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Quick({
  label,
  icon: Icon,
  onClick,
}: {
  label: string
  icon: any
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-14 items-center gap-2 rounded-xl border border-border bg-card px-3 text-left text-xs font-semibold transition hover:-translate-y-0.5 hover:border-primary/50"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      {label}
    </button>
  )
}

function Module({
  active,
  data,
  onAction,
  onOpen,
}: {
  active: string
  data: any[]
  onAction: () => void
  onOpen: (row: any) => void
}) {
  const [search, setSearch] = useState('')
  const meta = getModuleMeta(active)
  const columns = tableColumns[active] || []
  const filtered = data.filter((row) =>
    Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-5">
        <div className="mb-2 hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <span>Workspace</span>
          <ChevronRight className="size-3" />
          <span>{meta.title}</span>
        </div>
        <h1 className="text-2xl font-bold">{meta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.subtitle}</p>
      </div>
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nesta lista..."
            className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button className="flex min-h-12 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold">
          <Search className="size-4" />
          <span className="hidden sm:inline">Filtros</span>
        </button>
        {meta.action && (
          <button
            onClick={onAction}
            className="flex min-h-12 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">{meta.action}</span>
          </button>
        )}
      </div>
      <Panel className="overflow-hidden">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onOpen(row)}
                  className="cursor-pointer border-t border-border/50 hover:bg-muted/20"
                >
                  {active === 'funcionarios' ? (
                    <>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={row.name} size="sm" />
                          <div>
                            <p className="font-semibold">{row.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {row.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>{row.role}</td>
                      <td>{row.sector}</td>
                      <td>{row.shift}</td>
                      <td>{row.scale}</td>
                      <td>{row.inTime}</td>
                      <td>{row.outTime}</td>
                      <td>
                        <Badge tone={statusTone(row.status)}>
                          {row.status}
                        </Badge>
                      </td>
                    </>
                  ) : (
                    Object.entries(row)
                      .slice(0, columns.length)
                      .map(([key, value]) => (
                        <td key={key} className="px-4 py-4 text-muted-foreground">
                          {key.toLowerCase().includes('status') ||
                          key === 'contract' ? (
                            <Badge tone={statusTone(String(value))}>
                              {String(value)}
                            </Badge>
                          ) : (
                            String(value)
                          )}
                        </td>
                      ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col divide-y divide-border/50 md:hidden">
          {filtered.map((row, i) => (
            <button
              key={i}
              onClick={() => onOpen(row)}
              className="flex min-h-24 items-center gap-3 p-4 text-left"
            >
              <div className="flex-1">
                {active === 'funcionarios' ? (
                  <>
                    <p className="font-bold">{row.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.role}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {row.sector} · {row.inTime} → {row.outTime}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold">
                      {row.name ||
                        row.employee ||
                        row.item ||
                        row.title ||
                        row.date}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.sector ||
                        row.client ||
                        row.description ||
                        row.category ||
                        row.type ||
                        ''}
                    </p>
                  </>
                )}
              </div>
              <Badge
                tone={statusTone(
                  row.status || row.attendance || row.pending || row.contract || 'Ativo'
                )}
              >
                {row.status ||
                  row.attendance ||
                  row.pending ||
                  row.contract ||
                  'Ver'}
              </Badge>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhum registro encontrado.
          </div>
        )}
      </Panel>
    </div>
  )
}

function FormSheet({
  kind,
  onClose,
  onSave,
}: {
  kind: Modal
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [name, setName] = useState('')
  const [sector, setSector] = useState('Grajaú')
  if (kind === 'none') return null
  const title =
    kind === 'employee'
      ? 'Novo funcionário'
      : kind === 'sector'
      ? 'Novo setor'
      : kind === 'attestation'
      ? 'Novo atestado'
      : kind === 'stock'
      ? 'Movimentar estoque'
      : 'Registrar ocorrência'

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-t-3xl border border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Preencha os dados principais.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground"
          >
            <X />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            {kind === 'sector' ? 'Nome do setor' : 'Nome completo'}
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                kind === 'sector' ? 'Ex.: Unidade Norte' : 'Ex.: João da Silva'
              }
              className="h-12 rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
            />
          </label>
          {kind !== 'sector' && (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Setor
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="h-12 rounded-xl border border-border bg-background px-3"
              >
                <option>Grajaú</option>
                <option>Cidade Tiradentes</option>
                <option>São Miguel</option>
                <option>M&apos;Boi Mirim</option>
                <option>Condomínio Alpha</option>
                <option>Obra Central</option>
              </select>
            </label>
          )}
          <button
            onClick={() => onSave({ name, sector })}
            className="mt-2 h-12 rounded-xl bg-primary text-sm font-bold text-primary-foreground"
          >
            Salvar registro
          </button>
        </div>
      </div>
    </div>
  )
}

function Fab({ setModal }: { setModal: (m: Modal) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed bottom-24 right-4 z-30 flex flex-col items-end gap-2 lg:bottom-6">
      <div
        className={cn(
          'flex flex-col items-end gap-2 transition',
          open
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-90 opacity-0'
        )}
      >
        <button
          onClick={() => setModal('employee')}
          className="rounded-full bg-card px-4 py-3 text-sm font-semibold shadow-xl ring-1 ring-border"
        >
          + Funcionário
        </button>
        <button
          onClick={() => setModal('occurrence')}
          className="rounded-full bg-card px-4 py-3 text-sm font-semibold shadow-xl ring-1 ring-border"
        >
          + Ocorrência
        </button>
        <button
          onClick={() => setModal('stock')}
          className="rounded-full bg-card px-4 py-3 text-sm font-semibold shadow-xl ring-1 ring-border"
        >
          + Estoque
        </button>
      </div>
      <button
        aria-label="Ações rápidas"
        onClick={() => setOpen(!open)}
        className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition hover:scale-105"
      >
        <Plus className={cn('size-6 transition', open && 'rotate-45')} />
      </button>
    </div>
  )
}

export default function Home() {
  const [active, setActive] = useState<ModuleKey>('dashboard')
  const [more, setMore] = useState(false)
  const [modal, setModal] = useState<Modal>('none')
  const [query, setQuery] = useState('')
  const [theme, setThemeState] = useState<Theme>('dark')
  const [role, setRole] = useState<
    'Administrador' | 'Gestor' | 'Supervisor' | 'Operacional'
  >('Administrador')
  const [selectedSector, setSelectedSector] = useState('Todos os setores')

  const [employees, setEmployees] = useState<any[]>(seedEmployees)
  const [sectors, setSectors] = useState<any[]>(seedSectors)
  const [attestations, setAttestations] = useState<any[]>(seedAttestations)
  const [inventory, setInventory] = useState<any[]>(seedInventory)
  const [contracts] = useState<any[]>(seedContracts)
  const [uniforms] = useState<any[]>(seedUniforms)
  const [occurrences, setOccurrences] = useState<any[]>(seedOccurrences)

  useEffect(() => {
    const saved = window.localStorage.getItem('holanda-theme') as Theme | null
    setThemeState(saved || 'dark')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('holanda-theme', theme)
  }, [theme])

  useEffect(() => {
    const saved = window.sessionStorage.getItem('holanda-sector')
    if (saved) setSelectedSector(saved)
  }, [])

  useEffect(() => {
    window.sessionStorage.setItem('holanda-sector', selectedSector)
  }, [selectedSector])

  const setTheme = (t: Theme) => setThemeState(t)

  const allowedSectors =
    role === 'Supervisor' ? ['Grajaú', 'São Miguel'] : sectors.map((s) => s.name)
  const scopedEmployees = employees.filter(
    (e) =>
      allowedSectors.includes(e.sector) &&
      (selectedSector === 'Todos os setores' || e.sector === selectedSector)
  )
  const scopedSectors = sectors.filter(
    (s) =>
      allowedSectors.includes(s.name) &&
      (selectedSector === 'Todos os setores' || s.name === selectedSector)
  )

  const searchResults = useMemo(
    () =>
      [...scopedEmployees, ...scopedSectors]
        .filter((x) => JSON.stringify(x).toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5),
    [query, selectedSector, role, employees, sectors]
  )

  const data =
    active === 'setores'
      ? scopedSectors
      : active === 'funcionarios'
      ? scopedEmployees
      : active === 'frequencia'
      ? seedFrequencies
      : active === 'estoque'
      ? inventory
      : active === 'contratos'
      ? contracts
      : active === 'ocorrencias'
      ? occurrences
      : active === 'atestados'
      ? attestations
      : active === 'uniformes'
      ? uniforms
      : active === 'cargos'
      ? roles
      : active === 'usuarios'
      ? users
      : active === 'relatorios'
      ? reports.map((name) => ({
          name,
          description: 'Relatório operacional com filtros e exportação.',
          status: 'Pronto',
        }))
      : active === 'escalas'
      ? employees.slice(0, 8)
      : []

  const save = (value: any) => {
    if (modal === 'employee')
      setEmployees((p) => [
        {
          name: value.name || 'Novo funcionário',
          role: 'Auxiliar de Serviços Gerais',
          sector: value.sector,
          shift: 'Manhã',
          scale: '5x2',
          inTime: '08:00',
          outTime: '18:00',
          status: 'Ativo',
        },
        ...p,
      ])
    if (modal === 'sector')
      setSectors((p) => [
        {
          name: value.name || 'Novo setor',
          type: 'Unidade',
          address: 'A cadastrar',
          manager: 'Wagner',
          people: 0,
          schedule: '5x2',
          status: 'Em operação',
          contract: 'Novo',
        },
        ...p,
      ])
    if (modal === 'occurrence')
      setOccurrences((p) => [
        {
          date: '24/08/2026',
          sector: value.sector,
          employee: 'Wagner',
          type: 'Problema operacional',
          description: 'Nova ocorrência registrada.',
          owner: 'Wagner',
        },
        ...p,
      ])
    if (modal === 'attestation')
      setAttestations((p) => [
        {
          employee: value.name || 'Novo funcionário',
          start: '24/08/2026',
          end: '24/08/2026',
          days: '1 dia',
          status: 'Em andamento',
        },
        ...p,
      ])
    if (modal === 'stock')
      setInventory((p) => [
        {
          name: value.name || 'Novo item',
          category: 'Limpeza',
          unit: 'Unidade',
          current: '0',
          min: '5',
          max: '20',
          status: 'Abaixo do mínimo',
        },
        ...p,
      ])
    setModal('none')
  }

  const page =
    active === 'dashboard' || active === 'visao' ? (
      <Dashboard
        go={setActive}
        employees={scopedEmployees}
        sectors={scopedSectors}
        attestations={attestations.filter((a) =>
          allowedSectors.includes((a as any).sector || 'Grajaú')
        )}
        inventory={inventory}
        contracts={contracts}
        uniforms={uniforms}
      />
    ) : (
      <Module
        active={active}
        data={data}
        onAction={() =>
          setModal(
            active === 'funcionarios'
              ? 'employee'
              : active === 'setores'
              ? 'sector'
              : active === 'estoque'
              ? 'stock'
              : active === 'atestados'
              ? 'attestation'
              : 'occurrence'
          )
        }
        onOpen={() => {}}
      />
    )

  return (
    <>

      {/* <SidebarInset>


        {query && (
          <div className="fixed left-4 right-4 top-[68px] z-30 rounded-xl border border-border bg-card p-3 shadow-2xl sm:left-auto sm:right-8 sm:w-[390px]">
            <p className="mb-2 text-xs font-bold text-muted-foreground">
              Resultados
            </p>
            {searchResults.map((r: any, i) => (
              <button
                key={i}
                onClick={() => {
                  setActive(r.role ? 'funcionarios' : 'setores')
                  setQuery('')
                }}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-muted"
              >
                <Search className="size-4 text-primary" />
                <span className="text-sm">{r.name}</span>
              </button>
            ))}
          </div>
        )}

        <main className="min-h-[calc(100vh-72px)] p-4 pb-28 md:p-8 lg:pb-8">
          {page}
        </main>
      </SidebarInset> */}

      <MobileNav
        active={active}
        setActive={setActive}
        setMore={() => setMore(true)}
      />
      <MoreSheet open={more} setOpen={setMore} setActive={setActive} />
      <Fab setModal={setModal} />
      <FormSheet
        kind={modal}
        onClose={() => setModal('none')}
        onSave={save}
      />
    </>
  )
}