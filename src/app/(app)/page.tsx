'use client';

import { api } from '@/trpc/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Building2, Shirt, Clock, ArrowUpRight, BarChart3 } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = api.dashboard.getStats.useQuery(undefined, { retry: false });

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Visão Geral" icon={BarChart3} description="Bem-vindo ao Holanda Ops." />
        <EmptyState
          icon={BarChart3}
          title="Sem indicadores para o seu cargo"
          description="Use o menu para acessar as áreas liberadas para você."
        />
      </PageContainer>
    );
  }

  const shiftLabels: Record<string, string> = {
    MORNING: 'Manhã',
    AFTERNOON: 'Tarde',
    NIGHT: 'Noite',
    FLEXIBLE: 'Flexível',
  };

  return (
    <PageContainer>
      <PageHeader
        title="Visão Geral"
        icon={BarChart3}
        description="Acompanhe indicadores gerais de colaboradores, setores e logística de uniformes."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Colaboradores Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">Em atividade normal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Setores Cadastrados</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSectors}</div>
            <p className="text-xs text-muted-foreground">Departamentos mapeados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Demandas de Uniforme</CardTitle>
              <CardDescription>Quantidade necessária por tamanho de camiseta</CardDescription>
            </div>
            <Shirt className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {stats?.shirtSizesDistribution.map((item) => (
                <div key={item.size ?? 'NA'} className="flex flex-col items-center justify-center rounded-md border p-3 bg-card">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    Tamanho {item.size ?? 'N/A'}
                  </span>
                  <span className="text-xl font-bold mt-1">{item.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Distribuição por Turno</CardTitle>
              <CardDescription>Quantidade de funcionários alocados</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.shiftDistribution.map((item) => (
                <div key={item.shift ?? 'NA'} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                  <span className="font-medium">
                    {shiftLabels[item.shift ?? ''] ?? item.shift ?? 'Não definido'}
                  </span>
                  <Badge variant="secondary">{item.total} pessoas</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Últimas Admissões</CardTitle>
            <CardDescription>Colaboradores adicionados recentemente ao sistema</CardDescription>
          </div>
          <Link 
            href="/employees" 
            className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"
          >
            Ver todos <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {stats?.recentEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">CPF: {employee.cpf}</p>
                </div>
                <Badge variant={employee.status === 'active' ? 'default' : 'outline'}>
                  {employee.status === 'active' ? 'Ativo' : employee.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}