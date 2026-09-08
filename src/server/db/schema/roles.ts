import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const insertRoleSchema = z.object({
  name: z.string().min(2, 'Nome do perfil é obrigatório'),
  description: z.string().optional().nullable(),
});

export const updateRoleSchema = insertRoleSchema.partial().extend({
  id: z.string().uuid(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = z.infer<typeof insertRoleSchema>;