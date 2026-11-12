'use client';

import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { api, type RouterOutputs } from '@/trpc/react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { downloadCsv, toCsv, toReadableText } from '@/lib/export-csv';
import { copyText } from '@/lib/clipboard';
import { formatCpf, formatDate, formatShiftTime } from '@/lib/formatters';
import { employeeStatusLabel } from '@/lib/employee-status';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Employee = RouterOutputs['employee']['list'][number];

const yesNo = (value?: boolean) => (value ? 'Sim' : 'Não');

interface Column {
  key: string;
  label: string;
  group: 'Dados' | 'Alocação' | 'Uniforme';
  value: (employee: Employee) => string;
}

const COLUMNS: Column[] = [
  { key: 'name', label: 'Nome', group: 'Dados', value: (e) => e.name.trim() },
  { key: 'cpf', label: 'CPF', group: 'Dados', value: (e) => formatCpf(e.cpf) },
  { key: 'rg', label: 'RG', group: 'Dados', value: (e) => e.rg ?? '' },
  {
    key: 'pix',
    label: 'Chave Pix',
    group: 'Dados',
    value: (e) => e.pixKey ?? '',
  },
  {
    key: 'address',
    label: 'Endereço',
    group: 'Dados',
    value: (e) => e.address ?? '',
  },
  {
    key: 'createdAt',
    label: 'Cadastrado em',
    group: 'Dados',
    value: (e) => formatDate(e.createdAt),
  },
  {
    key: 'status',
    label: 'Situação',
    group: 'Alocação',
    value: (e) => employeeStatusLabel(e.status),
  },
  {
    key: 'sectors',
    label: 'Setores',
    group: 'Alocação',
    value: (e) => e.sector,
  },
  {
    key: 'shift',
    label: 'Turno',
    group: 'Alocação',
    value: (e) => e.shift?.name ?? '',
  },
  {
    key: 'shiftTime',
    label: 'Horário do turno',
    group: 'Alocação',
    value: (e) => (e.shift ? formatShiftTime(e.shift).replace('—', '') : ''),
  },
  {
    key: 'shirtSize',
    label: 'Tamanho da camisa',
    group: 'Uniforme',
    value: (e) => e.shirtSize,
  },
  {
    key: 'pantsSize',
    label: 'Tamanho da calça',
    group: 'Uniforme',
    value: (e) => e.pantsSize ?? '',
  },
  {
    key: 'shoeSize',
    label: 'Número do calçado',
    group: 'Uniforme',
    value: (e) => (e.shoeSize ? String(e.shoeSize) : ''),
  },
  {
    key: 'kitShirt',
    label: 'Camisa entregue',
    group: 'Uniforme',
    value: (e) => yesNo(e.uniform.shirt),
  },
  {
    key: 'kitPants',
    label: 'Calça entregue',
    group: 'Uniforme',
    value: (e) => yesNo(e.uniform.pants),
  },
  {
    key: 'kitShoes',
    label: 'Calçado entregue',
    group: 'Uniforme',
    value: (e) => yesNo(e.uniform.shoes),
  },
  {
    key: 'kitJacket',
    label: 'Jaqueta entregue',
    group: 'Uniforme',
    value: (e) => yesNo(e.uniform.jacket),
  },
];

const GROUPS = ['Dados', 'Alocação', 'Uniforme'] as const;
const DEFAULT_KEYS = ['name', 'cpf', 'sectors', 'shift', 'status'];

interface EmployeeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  filtered: Employee[];

  all: Employee[];

  picked: Employee[];
}

export function EmployeeExportDialog({
  open,
  onOpenChange,
  filtered,
  all,
  picked,
}: EmployeeExportDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(DEFAULT_KEYS),
  );
  type Scope = 'picked' | 'filtered' | 'all';

  const [chosen, setChosen] = useState<Scope | null>(null);
  const [lastOpen, setLastOpen] = useState(open);
  if (lastOpen !== open) {
    setLastOpen(open);
    if (open) setChosen(null);
  }

  const options: { value: Scope; label: string; rows: Employee[] }[] = [
    ...(picked.length > 0
      ? [
          {
            value: 'picked' as const,
            label: `Marcados (${picked.length})`,
            rows: picked,
          },
        ]
      : []),
    ...(picked.length === 0 && filtered.length !== all.length
      ? [
          {
            value: 'filtered' as const,
            label: `Lista atual (${filtered.length})`,
            rows: filtered,
          },
        ]
      : []),
    { value: 'all', label: `Todos (${all.length})`, rows: all },
  ];
  const active =
    options.find((option) => option.value === chosen) ??
    options.find((option) => option.value === 'picked') ??
    options.find((option) => option.value === 'filtered') ??
    options[options.length - 1]!;
  const rows = active.rows;
  const columns = COLUMNS.filter((column) => selected.has(column.key));

  const toggle = (key: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });

  const logExport = api.employee.logExport.useMutation();
  const log = (via: 'file' | 'copy') =>
    logExport.mutate({
      count: rows.length,
      scope: active.value,
      columns: columns.map((column) => column.key),
      via,
    });

  const handleCopy = async () => {
    const headers = columns.map((column) => column.label);
    const body = rows.map((employee) =>
      columns.map((column) => column.value(employee)),
    );
    const ok = await copyText(toReadableText(headers, body));
    if (ok) {
      log('copy');
      toast.success(`${rows.length} funcionário(s) copiado(s).`);
      onOpenChange(false);
    } else {
      toast.error('Não foi possível copiar. Tente exportar o arquivo.');
    }
  };

  const handleExport = () => {
    const csv = toCsv(
      columns.map((column) => column.label),
      rows.map((employee) => columns.map((column) => column.value(employee))),
    );
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`funcionarios-${date}.csv`, csv);
    log('file');
    toast.success(`${rows.length} funcionário(s) exportado(s).`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-[520px]">
        <DialogHeader className="bg-background shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Download className="text-muted-foreground size-5" />
            Exportar funcionários
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {options.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active.value === option.value}
                  onClick={() => setChosen(option.value)}
                  className={cn(
                    'h-9 flex-1 rounded-md border px-3 text-sm whitespace-nowrap transition-colors',
                    active.value === option.value
                      ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                      : 'text-muted-foreground hover:border-muted-foreground/30',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {GROUPS.map((group) => (
            <div key={group} className="space-y-1.5">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {group}
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {COLUMNS.filter((column) => column.group === group).map(
                  (column) => (
                    <label
                      key={column.key}
                      className="flex items-center gap-3 rounded-md border p-2.5 text-sm"
                    >
                      <Checkbox
                        checked={selected.has(column.key)}
                        onCheckedChange={(checked) =>
                          toggle(column.key, checked === true)
                        }
                      />
                      {column.label}
                    </label>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="bg-muted/20 shrink-0 gap-2 border-t px-6 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleCopy()}
            disabled={columns.length === 0 || rows.length === 0}
          >
            <Copy className="mr-2 size-4" />
            Copiar {rows.length}
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={columns.length === 0 || rows.length === 0}
          >
            <Download className="mr-2 size-4" />
            Exportar {rows.length}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
