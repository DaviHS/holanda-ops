import {
  pgTable,
  uuid,
  varchar,
  text,
  time,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { softDeleteAndTimestamps } from './helpers';

export const shifts = pgTable(
  'shifts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    startTime: time('start_time'),
    endTime: time('end_time'),
    description: text('description'),
    ...softDeleteAndTimestamps,
  },
  (table) => [
    uniqueIndex('shifts_name_active_uniq')
      .on(sql`lower(${table.name})`)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export type Shift = typeof shifts.$inferSelect;
