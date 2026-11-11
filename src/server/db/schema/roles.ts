import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { softDeleteAndTimestamps } from './helpers';

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  ...softDeleteAndTimestamps,
});

export type Role = typeof roles.$inferSelect;
