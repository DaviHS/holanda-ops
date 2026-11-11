import { eq, lt } from 'drizzle-orm';
import { db } from '@/server/db';
import {
  auditLogs,
  employees,
  roles,
  sectors,
  shifts,
  users,
} from '@/server/db/schema';

export const AUDIT_RETENTION_MONTHS = 24;
const PURGE_CHANCE = 0.02;

const SECRET_KEY = /password|senha|token|secret|hash/i;
/** Dados pessoais: não ficam guardados no histórico. */
const PERSONAL_KEY = /^(cpf|rg|pixKey|address)$/i;
const MAX_STRING = 200;
const MAX_ITEMS = 20;
const MAX_DEPTH = 3;

export function sanitizeAuditInput(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string')
    return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  if (depth >= MAX_DEPTH) return '…';
  if (Array.isArray(value))
    return value
      .slice(0, MAX_ITEMS)
      .map((item) => sanitizeAuditInput(item, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value).slice(0, MAX_ITEMS)) {
      out[key] =
        SECRET_KEY.test(key) || PERSONAL_KEY.test(key)
          ? '***'
          : sanitizeAuditInput(item, depth + 1);
    }
    return out;
  }
  return null;
}

async function purgeOldAudit() {
  const limit = new Date();
  limit.setMonth(limit.getMonth() - AUDIT_RETENTION_MONTHS);
  await db.delete(auditLogs).where(lt(auditLogs.createdAt, limit));
}

export async function recordAudit(entry: {
  userId: string | null;
  userLabel: string;
  action: string;
  target?: string | null;
  input: unknown;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId,
      userLabel: entry.userLabel.slice(0, 150),
      action: entry.action,
      target: entry.target ?? null,
      input: sanitizeAuditInput(entry.input),
    });
    if (Math.random() < PURGE_CHANCE) await purgeOldAudit();
  } catch (error) {
    console.error('[audit] falha ao registrar', error);
  }
}

/**
 * Nome legível do registro afetado, buscado ANTES da ação (assim exclusões
 * também ficam identificadas). Devolve null se não achar.
 */
export async function resolveAuditTarget(
  path: string,
  input: Record<string, unknown>,
): Promise<string | null> {
  const direct = input.name ?? input.email;
  if (typeof direct === 'string') return direct;

  const area = path.split('.')[0];
  // Ex.: shift.setEmployeeShift identifica o funcionário afetado.
  if (
    path === 'shift.setEmployeeShift' &&
    typeof input.employeeId === 'string'
  ) {
    const [row] = await db
      .select({ v: employees.name })
      .from(employees)
      .where(eq(employees.id, input.employeeId))
      .limit(1);
    return row?.v ?? null;
  }
  const id = typeof input.id === 'string' ? input.id : input.roleId;
  if (typeof id !== 'string') return null;

  try {
    switch (area) {
      case 'employee': {
        const [row] = await db
          .select({ v: employees.name })
          .from(employees)
          .where(eq(employees.id, id))
          .limit(1);
        return row?.v ?? null;
      }
      case 'sector': {
        const [row] = await db
          .select({ v: sectors.name })
          .from(sectors)
          .where(eq(sectors.id, id))
          .limit(1);
        return row?.v ?? null;
      }
      case 'shift': {
        const [row] = await db
          .select({ v: shifts.name })
          .from(shifts)
          .where(eq(shifts.id, id))
          .limit(1);
        return row?.v ?? null;
      }
      case 'role':
      case 'access': {
        const [row] = await db
          .select({ v: roles.name })
          .from(roles)
          .where(eq(roles.id, id))
          .limit(1);
        return row?.v ?? null;
      }
      case 'user': {
        const [row] = await db
          .select({ v: users.email })
          .from(users)
          .where(eq(users.id, id))
          .limit(1);
        return row?.v ?? null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}
