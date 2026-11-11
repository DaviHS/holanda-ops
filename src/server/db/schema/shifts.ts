import { pgTable, uuid, varchar, text, time } from 'drizzle-orm/pg-core';
import { softDeleteAndTimestamps } from './helpers';

export const shifts = pgTable('shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  startTime: time('start_time'),
  endTime: time('end_time'),
  description: text('description'),
  ...softDeleteAndTimestamps,
});

export type Shift = typeof shifts.$inferSelect;
