import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
  pgEnum,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { sectors } from './sectors';
import { shifts } from './shifts';
import { softDeleteAndTimestamps } from './helpers';

export const employeeStatusEnum = pgEnum('employee_status', [
  'pending',
  'active',
  'suspended',
  'inactive',
]);

export const shirtSizeEnum = pgEnum('shirt_size', [
  'PP',
  'P',
  'M',
  'G',
  'GG',
  'XGG',
]);

export type UniformStatus = {
  shirt: boolean;
  pants: boolean;
  shoes: boolean;
  jacket?: boolean;
};

export const employees = pgTable(
  'employees',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    shiftId: uuid('shift_id').references(() => shifts.id, {
      onDelete: 'set null',
    }),
    name: varchar('name', { length: 255 }).notNull(),
    cpf: varchar('cpf', { length: 14 }).notNull(),
    rg: varchar('rg', { length: 20 }),
    pixKey: varchar('pix_key', { length: 255 }),
    address: text('address'),
    avatarUrl: text('avatar_url'),
    status: employeeStatusEnum('status').default('active').notNull(),
    shirtSize: shirtSizeEnum('shirt_size').default('M').notNull(),
    pantsSize: varchar('pants_size', { length: 10 }),
    shoeSize: integer('shoe_size'),
    uniform: jsonb('uniform')
      .$type<UniformStatus>()
      .default({ shirt: false, pants: false, shoes: false, jacket: false })
      .notNull(),
    ...softDeleteAndTimestamps,
  },

  (table) => [
    uniqueIndex('employees_cpf_active_uniq')
      .on(table.cpf)
      .where(sql`${table.deletedAt} is null`),
    uniqueIndex('employees_user_id_active_uniq')
      .on(table.userId)
      .where(sql`${table.deletedAt} is null`),
    index('idx_employees_name').on(table.name),
    index('idx_employees_status').on(table.status),
    index('idx_employees_shift_id').on(table.shiftId),
  ],
);

export const employeeSectors = pgTable(
  'employee_sectors',
  {
    employeeId: uuid('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    sectorId: uuid('sector_id')
      .notNull()
      .references(() => sectors.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.employeeId, table.sectorId] }),
    index('idx_employee_sectors_employee_id').on(table.employeeId),
    index('idx_employee_sectors_sector_id').on(table.sectorId),
  ],
);

export type Employee = typeof employees.$inferSelect;
