-- Alinha o banco que já existe com a migração-base (drizzle/0000_baseline.sql). Idempotente.
-- Rode ANTES de `npm run db:baseline`.

-- Índices repetidos ou de pouca serventia
DROP INDEX IF EXISTS idx_employees_cpf;          -- já existe o único parcial employees_cpf_active_uniq
DROP INDEX IF EXISTS idx_employees_user_id;      -- já existe o único parcial employees_user_id_active_uniq
DROP INDEX IF EXISTS idx_employees_deleted_at;
DROP INDEX IF EXISTS idx_roles_deleted_at;
DROP INDEX IF EXISTS idx_sectors_deleted_at;
DROP INDEX IF EXISTS idx_shifts_deleted_at;
DROP INDEX IF EXISTS idx_users_deleted_at;

-- Índices que faltavam
CREATE INDEX IF NOT EXISTS idx_employees_shift_id ON employees (shift_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);

-- Datas de criação e alteração sempre preenchidas
UPDATE employees SET created_at = now() WHERE created_at IS NULL;
UPDATE employees SET updated_at = COALESCE(updated_at, created_at, now()) WHERE updated_at IS NULL;
UPDATE users SET created_at = now() WHERE created_at IS NULL;
UPDATE users SET updated_at = COALESCE(updated_at, created_at, now()) WHERE updated_at IS NULL;

ALTER TABLE employees ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN created_at SET NOT NULL,
                      ALTER COLUMN updated_at SET DEFAULT now(), ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE users     ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN created_at SET NOT NULL,
                      ALTER COLUMN updated_at SET DEFAULT now(), ALTER COLUMN updated_at SET NOT NULL;
