import { z } from 'zod';

export const shirtSizes = ['PP', 'P', 'M', 'G', 'GG', 'XGG'] as const;

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
    error: 'Selecione o tamanho da camiseta',
  }),
  pantsSize: z.string().optional(),
  shoeSize: z.number().optional(),
});

export type PublicEmployeeRegisterValues = z.infer<typeof publicEmployeeRegisterSchema>;