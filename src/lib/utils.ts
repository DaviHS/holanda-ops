import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatShiftTime(
  shift?: { startTime?: string | null; endTime?: string | null } | null
): string {
  if (!shift?.startTime || !shift?.endTime) return '—';
  
  // Trata casos em que a string venha vazia apenas com espaços
  const start = shift.startTime.trim();
  const end = shift.endTime.trim();

  if (!start || !end) return '—';

  return `${start} – ${end}`;
}