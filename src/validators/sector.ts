import { z } from 'zod';

export const sectorSchema = z.object({
  name: z.string().min(2, 'Nome do setor é obrigatório'),
  description: z.string().optional().nullable(),
});

export const sectorUpdateSchema = sectorSchema.partial().extend({
  id: z.string().uuid(),
});

export type SectorInput = z.infer<typeof sectorSchema>;
