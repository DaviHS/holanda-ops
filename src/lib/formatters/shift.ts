export function formatShiftTime(
  shift?: { startTime?: string | null; endTime?: string | null } | null,
): string {
  const start = shift?.startTime?.trim();
  const end = shift?.endTime?.trim();
  return start && end ? `${start} – ${end}` : '—';
}
