-- Permissões por cargo, flag de administrador e auditoria. Idempotente.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_admin" boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
  "permission" varchar(40) NOT NULL,
  PRIMARY KEY ("role_id", "permission")
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" serial PRIMARY KEY,
  "user_id" uuid,
  "user_label" varchar(150) NOT NULL,
  "action" varchar(100) NOT NULL,
  "target" text,
  "input" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" ("created_at");

-- Permissões iniciais dos cargos existentes
INSERT INTO "role_permissions" ("role_id", "permission")
SELECT r.id, p.permission
FROM "roles" r
JOIN (VALUES
  ('admin', 'employees.view'), ('admin', 'employees.manage'), ('admin', 'sectors.manage'),
  ('admin', 'shifts.manage'), ('admin', 'roles.manage'), ('admin', 'users.manage'), ('admin', 'audit.view'),
  ('manager', 'employees.view'), ('manager', 'employees.manage'),
  ('manager', 'sectors.manage'), ('manager', 'shifts.manage')
) AS p(role_name, permission) ON p.role_name = r.name
ON CONFLICT DO NOTHING;

-- Direito total (administradores)
UPDATE "users" SET "is_admin" = true
WHERE "email" IN ('davi.holanda.23@gmail.com', 'planetawagner1982@gmail.com');
