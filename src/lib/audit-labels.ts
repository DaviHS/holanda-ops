export const AUDIT_AREAS: Record<string, string> = {
  employee: 'Funcionários',
  sector: 'Setores',
  shift: 'Turnos',
  role: 'Cargos',
  user: 'Usuários',
  access: 'Permissões',
  auth: 'Acesso',
};

const ACTIONS: Record<string, string> = {
  'employee.create': 'Cadastrou funcionário',
  'employee.update': 'Editou funcionário',
  'employee.delete': 'Removeu funcionário',

  'sector.create': 'Criou setor',
  'sector.update': 'Editou setor',
  'sector.delete': 'Removeu setor',

  'shift.create': 'Criou turno',
  'shift.update': 'Editou turno',
  'shift.delete': 'Removeu turno',
  'shift.setEmployeeShift': 'Alterou o turno de um funcionário',

  'role.create': 'Criou cargo',
  'role.update': 'Editou cargo',
  'role.delete': 'Removeu cargo',

  'user.create': 'Criou usuário',
  'user.update': 'Editou usuário',
  'user.delete': 'Removeu usuário',
  'user.sendPasswordReset': 'Enviou link de redefinição de senha',

  'auth.requestPasswordReset': 'Pediu redefinição de senha',
  'auth.confirmPasswordReset': 'Redefiniu a própria senha',

  'access.setRolePermissions': 'Alterou as permissões de um cargo',
};

export const auditActionLabel = (action: string) => ACTIONS[action] ?? action;

const scalar = (value: unknown): string =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean'
    ? String(value)
    : '…';

export function summarizeAuditInput(input: unknown): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'object') return `#${scalar(input)}`;
  const parts: string[] = [];
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (value === null || value === undefined || value === '') continue;
    const text = Array.isArray(value)
      ? `[${value.map(scalar).join(', ')}]`
      : scalar(value);
    parts.push(`${key}: ${text.length > 60 ? `${text.slice(0, 60)}…` : text}`);
  }
  return parts.join(' · ');
}

const plain = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/** Ações cujo texto exibido (ou nome da área) contém o termo digitado. */
export function actionsMatching(term: string): string[] {
  const needle = plain(term);
  if (!needle) return [];
  return Object.entries(ACTIONS)
    .filter(([action, label]) => {
      const area = AUDIT_AREAS[action.split('.')[0] ?? ''] ?? '';
      return plain(label).includes(needle) || plain(area).includes(needle);
    })
    .map(([action]) => action);
}
