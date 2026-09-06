import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ModalType =
  | 'none'
  | 'employee'
  | 'sector'
  | 'occurrence'
  | 'stock'
  | 'attestation'

export function FormSheet({
  kind,
  onClose,
  onSave,
}: {
  kind: ModalType
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
            <p className="mt-1 text-xs text-muted-foreground">Preencha os dados principais.</p>
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
              placeholder={kind === 'sector' ? 'Ex.: Unidade Norte' : 'Ex.: João da Silva'}
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

export function Fab({ setModal }: { setModal: (m: ModalType) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-24 right-4 z-30 flex flex-col items-end gap-2 lg:bottom-6">
      <div
        className={cn(
          'flex flex-col items-end gap-2 transition',
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'
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