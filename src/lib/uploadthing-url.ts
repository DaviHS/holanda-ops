/** Só aceitamos endereços de arquivos do UploadThing (ninguém cola uma imagem de outro site). */
export function isUploadThingUrl(value: string): boolean {
  try {
    const { protocol, hostname } = new URL(value);
    return (
      protocol === 'https:' &&
      (hostname.endsWith('.ufs.sh') || hostname === 'utfs.io')
    );
  } catch {
    return false;
  }
}
