import 'server-only';

import { isNotNull } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';
import { db } from '@/server/db';
import { employees } from '@/server/db/schema/employees';
import { isUploadThingUrl } from '@/lib/uploadthing-url';

function keyFromUrl(url: string) {
  return new URL(url).pathname.split('/').filter(Boolean).pop();
}

export async function deleteUploadedFile(url: string | null | undefined) {
  if (!url || !isUploadThingUrl(url)) return;
  const key = keyFromUrl(url);
  if (!key) return;
  try {
    await new UTApi().deleteFiles(key);
  } catch (error) {
    console.error('[uploadthing] não foi possível apagar o arquivo', error);
  }
}

const ORPHAN_MIN_AGE_MS = 60 * 60 * 1000;

const SWEEP_EVERY_MS = 10 * 60 * 1000;
let lastSweep = 0;

export async function sweepOrphanUploads() {
  const now = Date.now();
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;

  try {
    const rows = await db
      .select({ avatarUrl: employees.avatarUrl })
      .from(employees)
      .where(isNotNull(employees.avatarUrl));
    const inUse = new Set(
      rows.flatMap((row) =>
        row.avatarUrl && isUploadThingUrl(row.avatarUrl)
          ? [keyFromUrl(row.avatarUrl)]
          : [],
      ),
    );

    const { files } = await new UTApi().listFiles();
    const orphans = files
      .filter(
        (file) =>
          !inUse.has(file.key) && now - file.uploadedAt > ORPHAN_MIN_AGE_MS,
      )
      .map((file) => file.key);

    if (orphans.length > 0) {
      await new UTApi().deleteFiles(orphans);
      console.info(
        `[uploadthing] ${orphans.length} imagem(ns) sem vínculo apagada(s)`,
      );
    }
  } catch (error) {
    console.error('[uploadthing] falha ao limpar imagens sem vínculo', error);
  }
}
