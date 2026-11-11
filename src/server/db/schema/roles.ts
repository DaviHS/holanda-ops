import { pgTable, uuid, varchar, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { softDeleteAndTimestamps } from './helpers';

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    description: text('description'),
    ...softDeleteAndTimestamps,
  },
  (table) => [
    uniqueIndex('roles_name_active_uniq')
      .on(sql`lower(${table.name})`)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export type Role = typeof roles.$inferSelect;
