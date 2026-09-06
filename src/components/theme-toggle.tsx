import { Moon, Sun } from 'lucide-react';

export type Theme = 'light' | 'dark';

type ThemeToggleProps = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  className?: string;
};

export function ThemeToggle({ theme, setTheme, className }: ThemeToggleProps) {
  return (
    <button
      aria-label="Alternar tema"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={className}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}