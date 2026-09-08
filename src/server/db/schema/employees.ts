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

export const employeeStatusEnum = pgEnum('employee_status', ['active', 'inactive']);
export const employeeShiftEnum = pgEnum('employee_shift', ['day', 'night']);
export const shirtSizeEnum = pgEnum('shirt_size', ['XS', 'S', 'M', 'L', 'XL', 'XXL']);

export type UniformStatus = {
  shirt: boolean;
  pants: boolean;
  shoes: boolean;
  jacket?: boolean;
};

// 1. Tabela Principal de Funcionários
export const employees = pgTable(
  'employees',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .unique()
      .references(() => users.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 255 }).notNull(),
    cpf: varchar('cpf', { length: 14 }).notNull().unique(),
    rg: varchar('rg', { length: 20 }),
    pixKey: varchar('pix_key', { length: 255 }),
    address: text('address'),
    status: employeeStatusEnum('status').default('active').notNull(),
    shift: employeeShiftEnum('shift').default('day').notNull(),
    entryTime: varchar('entry_time', { length: 5 }).default('08:00').notNull(),
    exitTime: varchar('exit_time', { length: 5 }).default('17:00').notNull(),
    shirtSize: shirtSizeEnum('shirt_size').default('M').notNull(),
    pantsSize: varchar('pants_size', { length: 10 }),
    shoeSize: integer('shoe_size'),
    uniform: jsonb('uniform')
      .$type<UniformStatus>()
      .default({ shirt: false, pants: false, shoes: false, jacket: false })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_employees_cpf').on(table.cpf),
    index('idx_employees_name').on(table.name),
    index('idx_employees_status').on(table.status),
    index('idx_employees_user_id').on(table.userId),
  ]
);

// 2. Tabela Intermediária (Muitos-para-Muitos: Funcionários <-> Setores)
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

// 3. Schemas de Validação Zod
const uniformSchema = z.object({
  shirt: z.boolean(),
  pants: z.boolean(),
  shoes: z.boolean(),
  jacket: z.boolean().optional(),
});

export const insertEmployeeSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  name: z.string().min(2, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  rg: z.string().optional().nullable(),
  pixKey: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  sectorIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos um setor'),
  status: z.enum(['active', 'inactive']).default('active'),
  shift: z.enum(['day', 'night']).default('day'),
  entryTime: z.string().default('08:00'),
  exitTime: z.string().default('17:00'),
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