import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/server/auth';
import { loadAccess } from '@/server/access';

const f = createUploadthing();

const PUBLIC_UPLOADS_PER_HOUR = 6;
const publicUploads = new Map<string, number[]>();

function allowPublicUpload(ip: string) {
  const now = Date.now();
  const recent = (publicUploads.get(ip) ?? []).filter(
    (at) => now - at < 60 * 60 * 1000,
  );
  if (recent.length >= PUBLIC_UPLOADS_PER_HOUR) {
    publicUploads.set(ip, recent);
    return false;
  }
  publicUploads.set(ip, [...recent, now]);
  return true;
}

export const uploadRouter = {
  employeeAvatar: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!session?.user) throw new UploadThingError('Faça login para enviar.');

      const access = await loadAccess(session.user.id);
      if (!access.active || !access.permissions.has('employees.manage')) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new UploadThingError(
          'Você não pode enviar fotos de funcionários.',
        );
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(({ file }) => ({ url: file.ufsUrl, key: file.key })),

  registerAvatar: f({
    image: { maxFileSize: '2MB', maxFileCount: 1 },
  })
    .middleware(({ req }) => {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        'unknown';
      if (!allowPublicUpload(ip)) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new UploadThingError(
          'Muitas fotos enviadas. Tente novamente mais tarde.',
        );
      }
      return {};
    })
    .onUploadComplete(({ file }) => ({ url: file.ufsUrl, key: file.key })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
