import { pgTable, uuid, varchar, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { roles } from './roles';

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permission: varchar('permission', { length: 40 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permission] })],
);

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
}));
