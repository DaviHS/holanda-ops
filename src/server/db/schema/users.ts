import { pgTable, uuid, varchar, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { roles } from './roles';
import { employees } from './employees';

export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    status: userStatusEnum('status').default('active').notNull(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
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

export const insertUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  roleId: z.string().uuid('Selecione um perfil válido'),
  employeeId: z.string().uuid('Selecione um funcionário válido'),
});

export const updateUserSchema = insertUserSchema.extend({
  id: z.string().uuid(),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .or(z.literal(''))
    .optional(),
});

export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;