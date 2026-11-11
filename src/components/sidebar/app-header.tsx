import { Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle, type Theme } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
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
  pageTitle?: string;
};

export function AppHeader({
  theme,
  setTheme,
  onLogout,
  homeUrl = '/',
  pageTitle,
}: AppHeaderProps) {
  return (
    <header className="border-border/80 bg-card/95 z-10 mx-4 my-2 flex h-14 shrink-0 items-center gap-2 rounded-md border px-4 shadow-sm backdrop-blur-md transition-all">
      <SidebarTrigger className="border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors [&_svg]:size-4" />
      <Separator orientation="vertical" className="mx-1 h-5" />

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
          {pageTitle && (
            <BreadcrumbItem className="text-foreground text-sm font-medium">
              {pageTitle}
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle
          theme={theme}
          setTheme={setTheme}
          className="border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors [&_svg]:size-4"
        />

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
