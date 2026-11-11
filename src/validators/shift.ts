import { z } from 'zod';

export const shiftSchema = z.object({
  name: z.string().min(2, 'Nome do turno é obrigatório'),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const shiftUpdateSchema = shiftSchema.partial().extend({
  id: z.string().uuid(),
});

export type ShiftInput = z.infer<typeof shiftSchema>;
