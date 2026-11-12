export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export const EMPLOYEE_STATUS: Record<
  EmployeeStatus,
  { label: string; hint: string; className: string }
> = {
  active: {
    label: 'Ativo',
    hint: 'Em atividade',
    className: 'bg-emerald-600 text-white',
  },
  pending: {
    label: 'Pendente',
    hint: 'Pré-cadastro aguardando aprovação',
    className: 'bg-amber-500 text-white',
  },
  suspended: {
    label: 'Suspenso',
    hint: 'Afastado temporariamente',
    className: 'bg-orange-600 text-white',
  },
  inactive: {
    label: 'Inativo',
    hint: 'Desligado',
    className: 'bg-muted text-muted-foreground',
  },
};

export const EMPLOYEE_STATUSES = Object.keys(
  EMPLOYEE_STATUS,
) as EmployeeStatus[];

export const employeeStatusLabel = (status: string) =>
  EMPLOYEE_STATUS[status as EmployeeStatus]?.label ?? status;
