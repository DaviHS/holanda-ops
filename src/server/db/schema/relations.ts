import { relations } from "drizzle-orm";
import { employees, employeeSectors, sectors } from "./index";

export const employeesRelations = relations(employees, ({ many }) => ({
  sectors: many(employeeSectors),
}));

export const employeeSectorsRelations = relations(employeeSectors, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeSectors.employeeId],
    references: [employees.id],
  }),
  sector: one(sectors, {
    fields: [employeeSectors.sectorId],
    references: [sectors.id],
  }),
}));

export const sectorsRelations = relations(sectors, ({ many }) => ({
  employees: many(employeeSectors),
}));