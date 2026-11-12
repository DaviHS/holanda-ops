import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/server/auth';
import { loadAccess } from '@/server/access';

const f = createUploadthing();

export const uploadRouter = {
  /** Foto de funcionário: uma imagem de até 4 MB, só para quem gerencia funcionários. */
  employeeAvatar: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      // UploadThingError é o jeito documentado de recusar um envio
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
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
