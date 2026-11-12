import { z } from 'zod';
import { isValidCpf, onlyDigits } from '@/lib/formatters/cpf';
import { isUploadThingUrl } from '@/lib/uploadthing-url';

const uniformSchema = z.object({
  shirt: z.boolean(),
  pants: z.boolean(),
  shoes: z.boolean(),
  jacket: z.boolean().optional(),
});

const employeeBase = z.object({
  userId: z.string().uuid().optional().nullable(),
  shiftId: z.string().uuid().optional().nullable(),
  name: z.string().min(2, 'Nome é obrigatório'),
  cpf: z.string().transform(onlyDigits).refine(isValidCpf, 'CPF inválido'),
  rg: z.string().optional().nullable(),
  pixKey: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  avatarUrl: z
    .string()
    .max(500)
    .refine(isUploadThingUrl, 'Foto inválida')
    .optional()
    .nullable(),
  sectorIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos um setor'),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  shirtSize: z.enum(['PP', 'P', 'M', 'G', 'GG', 'XGG']),
  pantsSize: z.string().optional().nullable(),
  shoeSize: z.number().optional().nullable(),
  uniform: uniformSchema,
});

export const employeeSchema = employeeBase.extend({
  status: employeeBase.shape.status.default('active'),
  shirtSize: employeeBase.shape.shirtSize.default('M'),
  uniform: uniformSchema.default({
    shirt: false,
    pants: false,
    shoes: false,
    jacket: false,
  }),
});

export const employeeUpdateSchema = employeeBase.partial().extend({
  id: z.string().uuid(),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
