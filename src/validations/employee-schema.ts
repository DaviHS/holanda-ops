import { z } from 'zod';

export const employeeFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  rg: z.string().optional().nullable(),
  pixKey: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  sector: z.string().min(1, 'Setor é obrigatório'),
  status: z.enum(['active', 'inactive']),
  shift: z.enum(['day', 'night']),
  entryTime: z.string().min(1, 'Horário de entrada é obrigatório'),
  exitTime: z.string().min(1, 'Horário de saída é obrigatório'),
  shirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  pantsSize: z.string().optional().nullable(),
  shoeSize: z.number().optional().nullable(),
  uniform: z.object({
    shirt: z.boolean(),
    pants: z.boolean(),
    shoes: z.boolean(),
    jacket: z.boolean().optional(),
  }),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;