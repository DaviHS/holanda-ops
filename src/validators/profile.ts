import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(100),
});

/** Formulário: acrescenta a confirmação (que não vai para o servidor). */
export const changePasswordFormSchema = changePasswordSchema
  .extend({ confirmPassword: z.string().min(1, 'Confirme a nova senha') })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem',
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ['newPassword'],
    message: 'A nova senha deve ser diferente da atual',
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
