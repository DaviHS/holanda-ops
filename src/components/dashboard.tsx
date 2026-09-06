import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  FileCheck2,
  FileText,
  Package,
  Shirt,
  UserRoundCheck,
  UserRoundX,
  Users,
  Zap,
} from 'lucide-react'
import { alerts, statusTone, todayOperation, type ModuleKey } from '@/components/data'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { Panel } from './panel'

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

export function Dashboard({
  go,
  employees,
  sectors,
  attestations,
  inventory,
  contracts,
  uniforms,
}: {
  go: (v: ModuleKey) => void
  employees: any[]
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
          <Kpi label="Funcionários" value={employees.length} caption="Ativos" icon={Users} />
          <Kpi label="Setores" value={sectors.length} caption="Operação" icon={Building2} />
          <Kpi label="Presentes" value={active} caption="90,5%" icon={UserRoundCheck} />
          <Kpi label="Ausentes" value={employees.length - active} caption="Hoje" icon={UserRoundX} tone="red" />
          <Kpi label="Atestados" value={attestations.length} caption="Andamento" icon={FileCheck2} />
          <Kpi label="Contratos" value={contracts.length} caption="Ativos" icon={FileText} />
          <Kpi label="Uniformes" value={uniforms.filter((x) => x.pending !== '—').length} caption="Pendências" icon={Shirt} />
          <Kpi label="Alertas" value={alerts.length} caption="Atenção" icon={Bell} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">Ações rápidas</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <Quick label="Funcionário" icon={Users} onClick={() => go('funcionarios')} />
          <Quick label="Registrar falta" icon={UserRoundX} onClick={() => go('frequencia')} />
          <Quick label="Atestado" icon={FileCheck2} onClick={() => go('atestados')} />
          <Quick label="Estoque" icon={Package} onClick={() => go('estoque')} />
          <Quick label="Ver escala" icon={CalendarDays} onClick={() => go('escalas')} />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 p-4 md:p-5">
            <div>
              <h2 className="font-bold">Operação de hoje</h2>
              <p className="mt-1 text-xs text-muted-foreground">Presença por setor</p>
            </div>
            <button onClick={() => go('frequencia')} className="text-xs font-semibold text-primary">
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
            <p className="mt-1 text-xs text-muted-foreground">Itens que pedem acompanhamento</p>
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