import { z } from 'zod';

const shiftBase = z.object({
  name: z.string().trim().min(2, 'Nome do turno é obrigatório'),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const hasBothOrNone = (data: {
  startTime?: string | null;
  endTime?: string | null;
}) => Boolean(data.startTime) === Boolean(data.endTime);

const timePairError = {
  message: 'Informe a entrada e a saída, ou deixe os dois em branco',
  path: ['endTime'],
};

export const shiftSchema = shiftBase.refine(hasBothOrNone, timePairError);

export const shiftUpdateSchema = shiftBase
  .extend({ id: z.string().uuid() })
  .refine(hasBothOrNone, timePairError);

export type ShiftInput = z.infer<typeof shiftSchema>;
