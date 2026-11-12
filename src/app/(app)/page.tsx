'use client';

import type { ElementType, ReactNode } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  Clock,
  Hourglass,
  Shirt,
  UserCheck,
} from 'lucide-react';
import { api } from '@/trpc/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContainer, PageHeader } from '@/components/page-header';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { EmployeeStatusBadge } from './employees/_components/employee-status-badge';

const since = (date: Date) =>
  formatDistanceToNow(date, { locale: ptBR, addSuffix: true });

interface StatCardProps {
  title: string;
  value: number;
  hint: ReactNode;
  icon: ElementType<{ className?: string }>;
  href?: string;
  highlight?: boolean;
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  href,
  highlight,
}: StatCardProps) {
  const card = (
    <Card
      className={cn(
        'h-full gap-1 py-4 transition-colors',
        href && 'hover:bg-muted/30',
        highlight && 'border-amber-500/50 bg-amber-500/5',
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={cn(
            'size-4',
            highlight ? 'text-amber-600' : 'text-muted-foreground',
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="block rounded-xl">
      {card}
    </Link>
  ) : (
    card
  );
}

function DashboardSkeleton() {
  return (
    <PageContainer>
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </PageContainer>
  );
}

export default function DashboardPage() {
  const { can } = usePermissions();
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = api.dashboard.getStats.useQuery(undefined, { retry: false });

  if (isLoading) return <DashboardSkeleton />;

  if (error || !stats) {
    const forbidden = error?.data?.code === 'FORBIDDEN';
    return (
      <PageContainer>
        <PageHeader
          title="Dashboard"
          icon={BarChart3}
          description="Bem-vindo ao Holanda Ops."
        />
        {forbidden ? (
          <EmptyState
            icon={BarChart3}
            title="Sem indicadores para o seu cargo"
            description="Use o menu para acessar as áreas liberadas para você."
          />
        ) : (
          <ErrorDisplay
            title="Não foi possível carregar o dashboard"
            message="Verifique a conexão e tente novamente."
            onRetry={() => void refetch()}
          />
        )}
      </PageContainer>
    );
  }

  const { byStatus } = stats;
  const activeShare =
    stats.totalEmployees > 0
      ? Math.round((byStatus.active / stats.totalEmployees) * 100)
      : 0;
  const activeTotal = byStatus.active;
  const maxShirt = Math.max(
    1,
    ...stats.shirtSizesDistribution.map((s) => s.total),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        icon={BarChart3}
        description="Acompanhe os indicadores de colaboradores, setores e uniformes."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Colaboradores ativos"
          value={byStatus.active}
          icon={UserCheck}
          href="/employees?status=active"
          hint={`de ${stats.totalEmployees} cadastrados (${activeShare}%)`}
        />
        <StatCard
          title="Aguardando aprovação"
          value={byStatus.pending}
          icon={Hourglass}
          href="/employees?status=pending"
          highlight={byStatus.pending > 0}
          hint={
            byStatus.pending > 0
              ? 'Pré-cadastros para revisar'
              : 'Nenhum pendente'
          }
        />
        <StatCard
          title="Setores"
          value={stats.totalSectors}
          icon={Building2}
          href={can('sectors.manage') ? '/sectors' : undefined}
          hint="Cadastrados"
        />
        <StatCard
          title="Turnos"
          value={stats.totalShifts}
          icon={Clock}
          href={can('shifts.manage') ? '/shifts' : undefined}
          hint="Cadastrados"
        />
      </div>

      {stats.pendingEmployees.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Pré-cadastros aguardando aprovação
              </CardTitle>
              <CardDescription>
                Pessoas que preencheram o cadastro público.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              render={<Link href="/employees?status=pending" />}
            >
              Revisar
              <ArrowUpRight className="ml-1 size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {stats.pendingEmployees.map((employee) => (
                <li key={employee.id}>
                  <Link
                    href={`/employees?editar=${employee.id}`}
                    className="hover:bg-muted/30 -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5"
                  >
                    <span className="truncate text-sm font-medium">
                      {employee.name.trim()}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {since(employee.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {byStatus.pending > stats.pendingEmployees.length && (
              <p className="text-muted-foreground mt-2 text-xs">
                e mais {byStatus.pending - stats.pendingEmployees.length}…
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Demandas de uniforme
              </CardTitle>
              <CardDescription>
                Camisetas por tamanho, só colaboradores ativos
              </CardDescription>
            </div>
            <Shirt className="text-muted-foreground size-5" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 md:grid-cols-3 xl:grid-cols-6">
              {stats.shirtSizesDistribution.map((item) => (
                <div
                  key={item.size}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-md border p-3',
                    item.total === 0 && 'text-muted-foreground opacity-60',
                  )}
                >
                  <span className="text-muted-foreground text-xs font-semibold">
                    {item.size}
                  </span>
                  <span className="mt-1 text-xl font-bold">{item.total}</span>
                  <span
                    aria-hidden
                    className="bg-muted mt-2 h-1 w-full overflow-hidden rounded-full"
                  >
                    <span
                      className="bg-primary block h-full rounded-full"
                      style={{ width: `${(item.total / maxShirt) * 100}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Distribuição por turno
              </CardTitle>
              <CardDescription>
                Colaboradores ativos em cada turno
              </CardDescription>
            </div>
            <Clock className="text-muted-foreground size-5" />
          </CardHeader>
          <CardContent>
            {stats.shiftDistribution.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum colaborador ativo ainda.
              </p>
            ) : (
              <ul className="space-y-3">
                {stats.shiftDistribution.map((item) => {
                  const share =
                    activeTotal > 0 ? (item.total / activeTotal) * 100 : 0;
                  return (
                    <li key={item.shift ?? 'sem-turno'} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span
                          className={cn(
                            'truncate font-medium',
                            !item.shift && 'text-muted-foreground italic',
                          )}
                        >
                          {item.shift ?? 'Sem turno'}
                        </span>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {item.total} · {Math.round(share)}%
                        </span>
                      </div>
                      <div
                        aria-hidden
                        className="bg-muted h-1.5 overflow-hidden rounded-full"
                      >
                        <div
                          className={cn(
                            'h-full rounded-full',
                            item.shift
                              ? 'bg-primary'
                              : 'bg-muted-foreground/50',
                          )}
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Últimos cadastros
            </CardTitle>
            <CardDescription>
              Colaboradores adicionados recentemente (sem os pendentes)
            </CardDescription>
          </div>
          <Link
            href="/employees"
            className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
          >
            Ver todos <ArrowUpRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentEmployees.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum colaborador cadastrado ainda.
            </p>
          ) : (
            <ul className="divide-y">
              {stats.recentEmployees.map((employee) => (
                <li key={employee.id}>
                  <Link
                    href={`/employees?editar=${employee.id}`}
                    className="hover:bg-muted/30 -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {employee.name.trim()}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {[employee.sector, since(employee.createdAt)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    {employee.status !== 'active' && (
                      <EmployeeStatusBadge status={employee.status} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
