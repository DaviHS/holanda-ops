import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

type DateInput = Date | string | null | undefined;

export function toDate(value: DateInput): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

export function formatDate(value: DateInput): string {
  const date = toDate(value);
  return date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "";
}

export function formatDateTime(value: DateInput): string {
  const date = toDate(value);
  return date ? format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "";
}
