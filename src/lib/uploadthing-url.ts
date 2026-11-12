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
