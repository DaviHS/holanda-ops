import { z } from 'zod';

const uniformSchema = z.object({
  shirt: z.boolean(),
  pants: z.boolean(),
  shoes: z.boolean(),
  jacket: z.boolean().optional(),
});

export const employeeSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  shiftId: z.string().uuid().optional().nullable(),
  name: z.string().min(2, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  rg: z.string().optional().nullable(),
  pixKey: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  sectorIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos um setor'),
  status: z
    .enum(['active', 'inactive', 'suspended', 'pending'])
    .default('active'),
  shirtSize: z.enum(['PP', 'P', 'M', 'G', 'GG', 'XGG']).default('M'),
  pantsSize: z.string().optional().nullable(),
  shoeSize: z.number().optional().nullable(),
  uniform: uniformSchema.default({
    shirt: false,
    pants: false,
    shoes: false,
    jacket: false,
  }),
});

export const employeeUpdateSchema = employeeSchema.partial().extend({
  id: z.string().uuid(),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
