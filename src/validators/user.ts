import { z } from 'zod';

export const userStatuses = ['active', 'inactive', 'suspended'] as const;

export const userSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido').max(255),

  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .or(z.literal(''))
    .optional(),
  status: z.enum(userStatuses).default('active'),
  roleId: z.string().uuid('Selecione um cargo válido'),
  employeeId: z.string().uuid('Selecione um funcionário válido'),
  isAdmin: z.boolean().default(false),
});

export const userUpdateSchema = userSchema.extend({
  id: z.string().uuid(),
});

export type UserInput = z.infer<typeof userSchema>;
