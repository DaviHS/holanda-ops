-- Alinha o enum shirt_size ao código (XG -> XGG). Idempotente.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'shirt_size' AND e.enumlabel = 'XG')
     AND NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'shirt_size' AND e.enumlabel = 'XGG') THEN
    ALTER TYPE shirt_size RENAME VALUE 'XG' TO 'XGG';
  END IF;
END $$;
