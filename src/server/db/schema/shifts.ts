import { pgTable, uuid, varchar, text, timestamp, time } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { softDeleteAndTimestamps } from './helpers';

export const shifts = pgTable('shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  startTime: time('start_time'),
  endTime: time('end_time'),
  description: text('description'),
  ...softDeleteAndTimestamps,
});

export const insertShiftSchema = z.object({
  name: z.string().min(2, 'Nome do turno é obrigatório'),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateShiftSchema = insertShiftSchema.partial().extend({
  id: z.string().uuid(),
});

export type Shift = typeof shifts.$inferSelect;
export type NewShift = z.infer<typeof insertShiftSchema>;