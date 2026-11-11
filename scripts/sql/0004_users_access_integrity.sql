-- Integridade de usuários e acesso. Idempotente; pode ser rodado mais de uma vez.
--
-- O banco não tinha NENHUMA restrição de unicidade (só índices comuns), apesar de o schema
-- declarar unique. Aqui entram índices únicos PARCIAIS (só registros não excluídos), então
-- um e-mail/CPF/nome de um registro removido pode ser usado de novo.
-- Antes de aplicar foi conferido que não há duplicados nos dados atuais.

-- Último acesso do usuário
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- users: e-mail único (sem diferenciar maiúsculas) entre os não excluídos
DROP INDEX IF EXISTS idx_users_email;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_uniq
  ON users (lower(email)) WHERE deleted_at IS NULL;

-- employees: CPF único e um funcionário por usuário
CREATE UNIQUE INDEX IF NOT EXISTS employees_cpf_active_uniq
  ON employees (cpf) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS employees_user_id_active_uniq
  ON employees (user_id) WHERE deleted_at IS NULL;

-- roles / sectors / shifts: nome único (sem diferenciar maiúsculas)
CREATE UNIQUE INDEX IF NOT EXISTS roles_name_active_uniq
  ON roles (lower(name)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS sectors_name_active_uniq
  ON sectors (lower(name)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS shifts_name_active_uniq
  ON shifts (lower(name)) WHERE deleted_at IS NULL;

-- Vínculos órfãos deixados por exclusões anteriores
UPDATE employees SET shift_id = NULL
  WHERE shift_id IN (SELECT id FROM shifts WHERE deleted_at IS NOT NULL);
DELETE FROM employee_sectors
  WHERE sector_id IN (SELECT id FROM sectors WHERE deleted_at IS NOT NULL);
UPDATE employees SET user_id = NULL
  WHERE user_id IN (SELECT id FROM users WHERE deleted_at IS NOT NULL);
