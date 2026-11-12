import { z } from 'zod';
import { isValidCpf } from '@/lib/formatters/cpf';

export const shirtSizes = ['PP', 'P', 'M', 'G', 'GG', 'XGG'] as const;

export const publicEmployeeRegisterSchema = z.object({
  name: z.string().min(3, 'Informe seu nome completo'),
  cpf: z
    .string()
    .min(11, 'CPF incompleto')
    .max(14, 'CPF inválido')
    .transform((val) => val.replace(/\D/g, '')) // Remove caracteres não numéricos
    .refine(isValidCpf, 'CPF inválido'),
  rg: z.string().optional(),
  pixKey: z.string().optional(),
  address: z.string().optional(),
  shirtSize: z.enum(shirtSizes, {
    error: 'Selecione o tamanho da camiseta',
  }),
  pantsSize: z.string().optional(),
  shoeSize: z.number().optional(),
  /** Armadilha anti-robô: campo escondido que pessoas não preenchem. */
  website: z.string().max(200).optional(),
  /** Quando a tela abriu (ms): preencher mais rápido que uma pessoa consegue indica robô. */
  openedAt: z.number().optional(),
});

/** Menor tempo, em ms, para uma pessoa preencher o formulário. */
export const MIN_REGISTER_FILL_MS = 4000;

export type PublicEmployeeRegisterValues = z.infer<
  typeof publicEmployeeRegisterSchema
>;
