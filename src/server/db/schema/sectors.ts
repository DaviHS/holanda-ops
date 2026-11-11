import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { softDeleteAndTimestamps } from './helpers';

export const sectors = pgTable('sectors', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  ...softDeleteAndTimestamps,
});

export type Sector = typeof sectors.$inferSelect;
