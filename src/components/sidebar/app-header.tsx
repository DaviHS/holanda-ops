import { Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle, type Theme } from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';

type AppHeaderProps = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onLogout: () => void;
  homeUrl?: string;
  homeLabel?: string;
  pageTitle?: string;
};

export function AppHeader({
  theme,
  setTheme,
  onLogout,
  homeUrl = '/',
  homeLabel = 'Início',
  pageTitle,
}: AppHeaderProps) {
  return (
    <header className="z-10 my-2 mx-4 flex h-14 shrink-0 items-center gap-2 rounded-md border border-border/80 bg-card/95 px-4 shadow-sm backdrop-blur-md transition-all">
      <SidebarTrigger className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary [&_svg]:size-4" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link
              href={homeUrl}
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Home className="size-4" />
              <span className="text-sm">{homeLabel}</span>
            </Link>
          </BreadcrumbItem>
          {pageTitle && (
            <BreadcrumbItem className="text-sm font-medium text-foreground">
              {pageTitle}
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle
          theme={theme}
          setTheme={setTheme}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary [&_svg]:size-4"
        />

        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </header>
  );
}