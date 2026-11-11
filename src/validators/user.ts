import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  roleId: z.string().uuid('Selecione um perfil válido'),
  employeeId: z.string().uuid('Selecione um funcionário válido'),
});

export const userUpdateSchema = userSchema.extend({
  id: z.string().uuid(),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .or(z.literal(''))
    .optional(),
});

export type UserInput = z.infer<typeof userSchema>;
