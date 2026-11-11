import { pgTable, uuid, varchar, boolean, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { roles } from './roles';
import { employees } from './employees';
import { softDeleteAndTimestamps } from './helpers';

export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    status: userStatusEnum('status').default('active').notNull(),
    isAdmin: boolean('is_admin').default(false).notNull(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    ...softDeleteAndTimestamps,
  },
  (table) => [
    index('idx_users_email').on(table.email),
    index('idx_users_role_id').on(table.roleId),
    index('idx_users_status').on(table.status),
  ]
);

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  employee: one(employees, {
    fields: [users.id],
    references: [employees.userId],
  }),
}));

export type User = typeof users.$inferSelect;
