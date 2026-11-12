import { z } from 'zod';
import { isPermission } from '@/lib/permissions';

export const roleSchema = z.object({
  name: z.string().trim().min(2, 'Nome do cargo é obrigatório'),
  description: z.string().optional().nullable(),
});

const permissionList = z
  .array(z.string().refine(isPermission, 'Permissão inválida'))
  .default([]);

export const roleSaveSchema = roleSchema.extend({
  permissions: permissionList,
});

export const roleUpdateSchema = roleSaveSchema.extend({
  id: z.string().uuid(),
});

export type RoleInput = z.infer<typeof roleSchema>;
