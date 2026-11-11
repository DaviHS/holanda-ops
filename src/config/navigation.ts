import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarClock,
  History,
  Settings2,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Permission } from '@/lib/permissions';

export interface NavLink {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Aparece se o usuário tiver ao menos UMA destas permissões. Sem valor = livre. */
  permissions?: Permission[];
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  children: NavLink[];
}

export type NavEntry = { section: string } | NavLink | NavGroup;

export const isSection = (entry: NavEntry): entry is { section: string } =>
  'section' in entry;
export const isGroup = (entry: NavEntry): entry is NavGroup =>
  'children' in entry;

const SECTORS: NavLink = {
  title: 'Setores',
  href: '/sectors',
  icon: Building2,
  permissions: ['sectors.manage', 'employees.view'],
};
const EMPLOYEES: NavLink = {
  title: 'Funcionários',
  href: '/employees',
  icon: Users,
  permissions: ['employees.view', 'employees.manage'],
};
const ROLES: NavLink = {
  title: 'Cargos',
  href: '/roles',
  icon: ShieldCheck,
  permissions: ['roles.manage'],
};
const SHIFTS: NavLink = {
  title: 'Turnos',
  href: '/shifts',
  icon: CalendarClock,
  permissions: ['shifts.manage', 'employees.view'],
};
const USERS: NavLink = {
  title: 'Usuários',
  href: '/users',
  icon: UserCog,
  permissions: ['users.manage'],
};
const AUDIT: NavLink = {
  title: 'Histórico',
  href: '/audit',
  icon: History,
  permissions: ['audit.view'],
};

export const NAVIGATION: NavEntry[] = [
  { section: 'Visão Geral' },
  { title: 'Dashboard', href: '/', icon: BarChart3 },
  { section: 'Gestão de Pessoal' },
  {
    title: 'Equipe e RH',
    icon: Briefcase,
    children: [SECTORS, EMPLOYEES, ROLES, SHIFTS],
  },
  { title: 'Configurações', icon: Settings2, children: [USERS, AUDIT] },
];

export const MOBILE_PRIMARY_LINKS: NavLink[] = [
  { title: 'Início', href: '/', icon: BarChart3 },
  SECTORS,
  EMPLOYEES,
];

export const MOBILE_SECONDARY_LINKS: NavLink[] = [ROLES, SHIFTS, USERS, AUDIT];

type CanFn = (...permissions: Permission[]) => boolean;

export const isLinkAllowed = (link: NavLink, can: CanFn) =>
  can(...(link.permissions ?? []));

/** Remove links sem permissão e grupos/seções que ficaram vazios. */
export function filterNavigation(entries: NavEntry[], can: CanFn): NavEntry[] {
  const allowed: NavEntry[] = [];
  for (const entry of entries) {
    if (isSection(entry)) {
      allowed.push(entry);
    } else if (isGroup(entry)) {
      const children = entry.children.filter((child) =>
        isLinkAllowed(child, can),
      );
      if (children.length > 0) allowed.push({ ...entry, children });
    } else if (isLinkAllowed(entry, can)) {
      allowed.push(entry);
    }
  }
  return allowed.filter((entry, index, list) => {
    if (!isSection(entry)) return true;
    const next = list[index + 1];
    return next !== undefined && !isSection(next);
  });
}

/** "/" só é ativo na raiz; os demais ativam também nas subrotas. */
export const isLinkActive = (pathname: string, href: string) =>
  href === '/'
    ? pathname === '/'
    : pathname === href || pathname.startsWith(`${href}/`);

/** Trilha do breadcrumb para a rota atual, ex.: "/employees" -> ["Equipe e RH", "Funcionários"]. */
export function getBreadcrumb(pathname: string): string[] {
  for (const entry of NAVIGATION) {
    if (isSection(entry)) continue;
    if (isGroup(entry)) {
      const child = entry.children.find((link) =>
        isLinkActive(pathname, link.href),
      );
      if (child) return [entry.title, child.title];
    } else if (entry.href !== '/' && isLinkActive(pathname, entry.href)) {
      return [entry.title];
    }
  }
  return [];
}
