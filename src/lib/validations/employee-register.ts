import { z } from 'zod';

export const shirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const publicEmployeeRegisterSchema = z.object({
  name: z.string().min(3, 'Informe seu nome completo'),
  cpf: z
    .string()
    .min(11, 'CPF incompleto')
    .max(14, 'CPF inválido')
    .transform((val) => val.replace(/\D/g, '')), // Remove caracteres não numéricos
  rg: z.string().optional(),
  pixKey: z.string().optional(),
  address: z.string().optional(),
  shirtSize: z.enum(shirtSizes, {
    required_error: 'Selecione o tamanho da camiseta',
  }),
  pantsSize: z.string().optional(),
  shoeSize: z.coerce.number().optional(),
});

export type PublicEmployeeRegisterValues = z.infer<typeof publicEmployeeRegisterSchema>;