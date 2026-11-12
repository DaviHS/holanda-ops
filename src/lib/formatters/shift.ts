export const trimTime = (time?: string | null) =>
  time?.trim().slice(0, 5) ?? '';

type ShiftTimes = { startTime?: string | null; endTime?: string | null } | null;

export function formatShiftTime(shift?: ShiftTimes): string {
  const start = trimTime(shift?.startTime);
  const end = trimTime(shift?.endTime);
  return start && end ? `${start} – ${end}` : '—';
}

const toMinutes = (time?: string | null) => {
  const match = /^(\d{2}):(\d{2})/.exec(time?.trim() ?? '');
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

export function isOvernightShift(shift?: ShiftTimes): boolean {
  const start = toMinutes(shift?.startTime);
  const end = toMinutes(shift?.endTime);
  return start !== null && end !== null && end < start;
}

export function formatShiftDuration(shift?: ShiftTimes): string {
  const start = toMinutes(shift?.startTime);
  const end = toMinutes(shift?.endTime);
  if (start === null || end === null) return '';
  const diff = end - start;
  const total = diff > 0 ? diff : diff + 24 * 60;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes === 0
    ? `${hours}h`
    : `${hours}h${String(minutes).padStart(2, '0')}`;
}
