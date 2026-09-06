import { useState } from 'react'
import { ChevronRight, Plus, Search } from 'lucide-react'
import { UserAvatar } from '@/components/brand'
import { getModuleMeta, statusTone, tableColumns } from '@/components/data'
import { Badge } from './badge'
import { Panel } from './panel'

export function Module({
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
                            <p className="text-[11px] text-muted-foreground">{row.role}</p>
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
                        <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                      </td>
                    </>
                  ) : (
                    Object.entries(row)
                      .slice(0, columns.length)
                      .map(([key, value]) => (
                        <td key={key} className="px-4 py-4 text-muted-foreground">
                          {key.toLowerCase().includes('status') || key === 'contract' ? (
                            <Badge tone={statusTone(String(value))}>{String(value)}</Badge>
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
                    <p className="mt-1 text-xs text-muted-foreground">{row.role}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {row.sector} · {row.inTime} → {row.outTime}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold">
                      {row.name || row.employee || row.item || row.title || row.date}
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
                {row.status || row.attendance || row.pending || row.contract || 'Ver'}
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