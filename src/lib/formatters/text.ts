/** Texto ou "—" quando vazio/nulo. */
export const orDash = (value?: string | null) => (value?.trim() ? value : "—");
