export const PERMISSION_GROUPS = [
  {
    title: 'Pessoas',
    items: [
      {
        key: 'employees.view',
        label: 'Ver funcionários',
        description:
          'Consultar funcionários, setores, turnos e o painel de indicadores.',
      },
      {
        key: 'employees.manage',
        label: 'Gerenciar funcionários',
        description: 'Cadastrar, editar e remover funcionários.',
      },
    ],
  },
  {
    title: 'Estrutura',
    items: [
      {
        key: 'sectors.manage',
        label: 'Gerenciar setores',
        description: 'Criar, editar e remover setores.',
      },
      {
        key: 'shifts.manage',
        label: 'Gerenciar turnos',
        description: 'Criar, editar e remover turnos.',
      },
      {
        key: 'roles.manage',
        label: 'Gerenciar cargos e permissões',
        description: 'Criar cargos e definir o que cada cargo pode fazer.',
      },
    ],
  },
  {
    title: 'Acesso',
    items: [
      {
        key: 'users.manage',
        label: 'Gerenciar usuários',
        description:
          'Criar contas, redefinir senhas e definir o cargo de cada usuário.',
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        key: 'audit.view',
        label: 'Ver o histórico de alterações',
        description: 'Consultar quem alterou o quê no sistema.',
      },
    ],
  },
] as const;

export type Permission =
  (typeof PERMISSION_GROUPS)[number]['items'][number]['key'];

export const PERMISSIONS: Permission[] = PERMISSION_GROUPS.flatMap((group) =>
  group.items.map((item): Permission => item.key),
);

export const isPermission = (value: unknown): value is Permission =>
  PERMISSIONS.some((permission) => permission === value);

export const permissionLabel = (permission: Permission): string =>
  PERMISSION_GROUPS.flatMap((group) => [...group.items]).find(
    (item) => item.key === permission,
  )?.label ?? permission;
