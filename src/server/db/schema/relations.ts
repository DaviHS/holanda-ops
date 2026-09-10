import { relations } from "drizzle-orm";
import { employees, employeeSectors } from "./employees";
import { sectors } from "./sectors";
import { shifts } from "./shifts";

export const employeesRelations = relations(employees, ({ one, many }) => ({
  shift: one(shifts, {
    fields: [employees.shiftId],
    references: [shifts.id],
  }),
  sectors: many(employeeSectors),
}));

export const shiftsRelations = relations(shifts, ({ many }) => ({
  employees: many(employees),
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