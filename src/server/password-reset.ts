import { createHash, randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { users } from '@/server/db/schema/users';
import { escapeHtml, sendEmail } from '@/server/email';

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
export const RESET_RESEND_COOLDOWN_MS = 60 * 1000;

export const hashResetToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '');

function resetEmail(link: string) {
  const text = [
    'Recebemos um pedido para redefinir a sua senha no Holanda OPS.',
    '',
    'Para criar uma nova senha, acesse (o link vale por 1 hora):',
    link,
    '',
    'Se você não pediu isso, ignore este e-mail. Sua senha continua a mesma.',
  ].join('\n');
  const safeLink = escapeHtml(link);
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#111">
<p>Recebemos um pedido para redefinir a sua senha no <strong>Holanda OPS</strong>.</p>
<p><a href="${safeLink}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">Criar nova senha</a></p>
<p style="font-size:13px;color:#555">O link vale por 1 hora. Se o botão não funcionar, copie este endereço no navegador:<br>${safeLink}</p>
<p style="font-size:13px;color:#555">Se você não pediu isso, ignore este e-mail. Sua senha continua a mesma.</p>
</div>`;
  return { subject: 'Redefinição de senha', text, html };
}

/**
 * Gera um token novo (guardando só o hash), e envia o link por e-mail.
 * Devolve false se o e-mail não pôde ser enviado ou se a URL do app não está configurada.
 */
export async function sendPasswordResetLink(user: {
  id: string;
  email: string;
}): Promise<boolean> {
  const base = appUrl();
  if (!base) {
    console.error('[password-reset] NEXT_PUBLIC_APP_URL não configurada.');
    return false;
  }

  const token = randomBytes(32).toString('base64url');
  await db
    .update(users)
    .set({
      resetToken: hashResetToken(token),
      resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  const link = `${base}/reset-password?token=${token}`;
  const sent = await sendEmail({ to: user.email, ...resetEmail(link) });
  if (!sent && process.env.NODE_ENV !== 'production')
    console.info('[password-reset] link (dev):', link);
  return sent;
}
