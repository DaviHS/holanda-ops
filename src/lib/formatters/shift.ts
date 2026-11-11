/** "08:00:00" (como vem do banco) vira "08:00". */
export const trimTime = (time?: string | null) =>
  time?.trim().slice(0, 5) ?? '';

export function formatShiftTime(
  shift?: { startTime?: string | null; endTime?: string | null } | null,
): string {
  const start = trimTime(shift?.startTime);
  const end = trimTime(shift?.endTime);
  return start && end ? `${start} – ${end}` : '—';
}
