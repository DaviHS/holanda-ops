import { z } from 'zod';
import { isValidCpf } from '@/lib/formatters/cpf';

export const shirtSizes = ['PP', 'P', 'M', 'G', 'GG', 'XGG'] as const;

export const publicEmployeeRegisterSchema = z.object({
  name: z.string().min(3, 'Informe seu nome completo'),
  cpf: z
    .string()
    .min(11, 'CPF incompleto')
    .max(14, 'CPF inválido')
    .transform((val) => val.replace(/\D/g, ''))
    .refine(isValidCpf, 'CPF inválido'),
  rg: z.string().optional(),
  pixKey: z.string().optional(),
  address: z.string().optional(),
  shirtSize: z.enum(shirtSizes, {
    error: 'Selecione o tamanho da camiseta',
  }),
  pantsSize: z.string().optional(),
  shoeSize: z.number().optional(),

  website: z.string().max(200).optional(),

  openedAt: z.number().optional(),
});

export const MIN_REGISTER_FILL_MS = 4000;

export type PublicEmployeeRegisterValues = z.infer<
  typeof publicEmployeeRegisterSchema
>;
