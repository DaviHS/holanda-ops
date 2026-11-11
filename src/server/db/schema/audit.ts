import {
  pgTable,
  serial,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id'),
    userLabel: varchar('user_label', { length: 150 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    target: text('target'),
    input: jsonb('input'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_audit_logs_created_at').on(table.createdAt)],
);

export type AuditLog = typeof auditLogs.$inferSelect;
