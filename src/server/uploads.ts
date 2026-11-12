import 'server-only';

import { isNotNull } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';
import { db } from '@/server/db';
import { employees } from '@/server/db/schema/employees';
import { isUploadThingUrl } from '@/lib/uploadthing-url';

function keyFromUrl(url: string) {
  return new URL(url).pathname.split('/').filter(Boolean).pop();
}

/** Apaga do UploadThing o arquivo de um endereço antigo. Falhar aqui nunca quebra a ação principal. */
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

// Arquivos recém-enviados ainda podem estar num cadastro aberto: só mexe nos mais antigos.
const ORPHAN_MIN_AGE_MS = 60 * 60 * 1000;
// Evita varrer o UploadThing a cada login quando várias pessoas entram juntas.
const SWEEP_EVERY_MS = 10 * 60 * 1000;
let lastSweep = 0;

/**
 * Apaga do UploadThing as imagens que nenhum funcionário usa.
 * Chamada no login, sem esperar; qualquer falha é só registrada no log.
 */
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
