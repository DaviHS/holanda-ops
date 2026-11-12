const UNIQUE_MESSAGES: Record<string, string> = {
  users_email_active_uniq: 'Este e-mail já está cadastrado no sistema.',
  employees_cpf_active_uniq:
    'Já existe um funcionário cadastrado com este CPF.',
  employees_user_id_active_uniq:
    'Este funcionário já possui uma conta de usuário vinculada.',
  roles_name_active_uniq: 'Já existe um cargo com este nome.',
  sectors_name_active_uniq: 'Já existe um setor com este nome.',
  shifts_name_active_uniq: 'Já existe um turno com este nome.',
};

interface PgError {
  code?: unknown;
  constraint?: unknown;
  cause?: unknown;
}

export function uniqueViolationMessage(error: unknown): string | null {
  let current: unknown = error;
  for (
    let depth = 0;
    depth < 5 && current && typeof current === 'object';
    depth++
  ) {
    const { code, constraint, cause } = current as PgError;
    if (code === '23505') {
      return (
        (typeof constraint === 'string'
          ? UNIQUE_MESSAGES[constraint]
          : undefined) ?? 'Já existe um registro com estes dados.'
      );
    }
    current = cause;
  }
  return null;
}
