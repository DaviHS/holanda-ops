import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(2, 'Nome do perfil é obrigatório'),
  description: z.string().optional().nullable(),
});

export const roleUpdateSchema = roleSchema.partial().extend({
  id: z.string().uuid(),
});

export type RoleInput = z.infer<typeof roleSchema>;
