import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const sectors = pgTable('sectors', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const insertSectorSchema = z.object({
  name: z.string().min(2, 'Nome do setor é obrigatório'),
  description: z.string().optional().nullable(),
});

export const updateSectorSchema = insertSectorSchema.partial().extend({
  id: z.string().uuid(),
});

export type Sector = typeof sectors.$inferSelect;
export type NewSector = z.infer<typeof insertSectorSchema>;