import { cn } from '@/lib/utils'

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/70 bg-card shadow-sm',
        className
      )}
    >
      {children}
    </section>
  )
}