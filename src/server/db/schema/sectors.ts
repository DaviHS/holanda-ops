import { pgTable, uuid, varchar, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { softDeleteAndTimestamps } from './helpers';

export const sectors = pgTable(
  'sectors',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    ...softDeleteAndTimestamps,
  },
  (table) => [
    uniqueIndex('sectors_name_active_uniq')
      .on(sql`lower(${table.name})`)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export type Sector = typeof sectors.$inferSelect;
