import { cn } from '@/lib/utils'

export function HolandaMark({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 44 44"
        aria-label="Símbolo Holanda OPS"
        className="size-10 shrink-0"
        fill="none"
      >
        <circle
          cx="22"
          cy="22"
          r="18"
          stroke="currentColor"
          strokeWidth="2"
          opacity=".32"
        />
        <path
          d="M12 12v20M32 12v20M12 22h20M12 12l10 10 10-10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="12" r="3.5" fill="var(--primary)" />
      </svg>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-sans text-[15px] font-extrabold tracking-[0.22em] text-foreground">
            HOLANDA
          </span>
          <span className="mt-1 font-sans text-[15px] font-extrabold tracking-[0.28em] text-primary">
            OPS
          </span>
        </div>
      )}
      {compact && (
        <span className="font-sans text-lg font-extrabold tracking-[0.22em] text-foreground">
          OPS
        </span>
      )}
    </div>
  )
}

export function UserAvatar({
  name = 'Wagner',
  size = 'md',
}: {
  name?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary ring-1 ring-primary/25',
        size === 'sm'
          ? 'size-8 text-[11px]'
          : size === 'lg'
            ? 'size-14 text-base'
            : 'size-10 text-xs'
      )}
      aria-label={`Avatar de ${name}`}
    >
      {initials}
    </div>
  )
}