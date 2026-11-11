-- Nomes dos cargos padrão em português. Idempotente.
-- Nenhum código depende do nome do cargo (o acesso vem de users.is_admin e de role_permissions),
-- então renomear é seguro. Só renomeia se o nome novo ainda não existir entre os cargos ativos.
UPDATE roles SET name = 'Administrador', updated_at = now()
  WHERE lower(name) = 'admin' AND deleted_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM roles r WHERE lower(r.name) = 'administrador' AND r.deleted_at IS NULL);

UPDATE roles SET name = 'Gerente', updated_at = now()
  WHERE lower(name) = 'manager' AND deleted_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM roles r WHERE lower(r.name) = 'gerente' AND r.deleted_at IS NULL);

UPDATE roles SET name = 'Funcionário', updated_at = now()
  WHERE lower(name) = 'employee' AND deleted_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM roles r WHERE lower(r.name) = 'funcionário' AND r.deleted_at IS NULL);
