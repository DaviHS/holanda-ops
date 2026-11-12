import { Fragment } from 'react';
import { Home, LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type AppHeaderProps = {
  onLogout: () => void;
  homeUrl?: string;
  /** Itens depois do ícone de início, ex.: ["Equipe e RH", "Funcionários"]. */
  trail?: string[];
};

export function AppHeader({
  onLogout,
  homeUrl = '/',
  trail = [],
}: AppHeaderProps) {
  return (
    <header className="border-border/80 bg-card/95 z-10 mx-4 my-2 flex h-14 shrink-0 items-center gap-2 rounded-md border px-4 shadow-sm backdrop-blur-md transition-all">
      <SidebarTrigger className="border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors [&_svg]:size-4" />
      <Separator orientation="vertical" className="mx-1 h-5! self-center!" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link
              href={homeUrl}
              aria-label="Início"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Home className="size-4" />
            </Link>
          </BreadcrumbItem>
          {trail.map((label, index) => (
            <Fragment key={label}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === trail.length - 1 ? (
                  <BreadcrumbPage className="text-sm font-medium">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <span className="text-muted-foreground text-sm">{label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/profile"
          aria-label="Meu perfil"
          title="Meu perfil"
          className="border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors [&_svg]:size-4"
        >
          <UserRound />
        </Link>

        <ThemeToggle className="border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors [&_svg]:size-4" />

        <button
          onClick={onLogout}
          className="border-border bg-background text-muted-foreground hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </header>
  );
}
