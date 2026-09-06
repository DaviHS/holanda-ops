import { cn } from '@/lib/utils'

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        tone === 'success' && 'bg-emerald-500/10 text-emerald-500',
        tone === 'warning' && 'bg-amber-500/10 text-amber-400',
        tone === 'danger' && 'bg-rose-500/10 text-rose-400',
        tone === 'info' && 'bg-sky-500/10 text-sky-400',
        tone === 'neutral' && 'bg-muted text-muted-foreground'
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}