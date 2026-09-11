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
} from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { users } from './users';
import { sectors } from './sectors';
import { shifts } from './shifts';
import { softDeleteAndTimestamps } from './helpers';

export const employeeStatusEnum = pgEnum("employee_status", [
  "pending",   // Aguardando preenchimento do onboarding/aprovação
  "active",    // Ativo e apto para escalas
  "suspended", // Suspenso temporariamente
  "inactive",  // Inativo, não participa de escalas
]);

export const shirtSizeEnum = pgEnum('shirt_size', ['XS', 'S', 'M', 'L', 'XL', 'XXL']);

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
    userId: uuid('user_id')
      .unique()
      .references(() => users.id, { onDelete: 'set null' }),
    shiftId: uuid('shift_id').references(() => shifts.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 255 }).notNull(),
    cpf: varchar('cpf', { length: 14 }).notNull().unique(),
    rg: varchar('rg', { length: 20 }),
    pixKey: varchar('pix_key', { length: 255 }),
    address: text('address'),
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
    index('idx_employees_cpf').on(table.cpf),
    index('idx_employees_name').on(table.name),
    index('idx_employees_status').on(table.status),
    index('idx_employees_user_id').on(table.userId),
    index('idx_employees_shift_id').on(table.shiftId),
  ]
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
  ]
);

const uniformSchema = z.object({
  shirt: z.boolean(),
  pants: z.boolean(),
  shoes: z.boolean(),
  jacket: z.boolean().optional(),
});

export const insertEmployeeSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  shiftId: z.string().uuid().optional().nullable(),
  name: z.string().min(2, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  rg: z.string().optional().nullable(),
  pixKey: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  sectorIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos um setor'),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']).default('active'),
  shirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']).default('M'),
  pantsSize: z.string().optional().nullable(),
  shoeSize: z.number().optional().nullable(),
  uniform: uniformSchema.default({ shirt: false, pants: false, shoes: false, jacket: false }),
});

export const updateEmployeeSchema = insertEmployeeSchema.partial().extend({
  id: z.string().uuid(),
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = z.infer<typeof insertEmployeeSchema>;