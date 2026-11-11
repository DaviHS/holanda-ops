-- Recuperação de senha: guarda o hash do token e a validade. Idempotente.
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token varchar(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires timestamptz;
