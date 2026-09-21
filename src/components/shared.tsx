import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export const nativeSelectClassName =
  'h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export const nativeTextareaClassName =
  'min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export function PageHeader({
  title,
  description,
  action
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
}

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = 'blue'
}: {
  title: string
  value: string | number
  detail: string
  icon: LucideIcon
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'violet'
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600'
  }
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1.5 text-xs text-slate-500">{detail}</p>
        </div>
        <div className={cn('rounded-xl p-2.5', tones[tone])}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SearchBox({
  value,
  onChange,
  placeholder = 'Search records...'
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
}

export function FilterSelect({
  value,
  onChange,
  label,
  options
}: {
  value: string
  onChange: (value: string) => void
  label: string
  options: readonly string[]
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={event => onChange(event.target.value)}
      className={cn(nativeSelectClassName, 'font-medium text-slate-600')}
    >
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-3 md:flex-row', className)}>{children}</div>
}

export function RegisterCard({
  title,
  toolbar,
  isEmpty,
  emptyTitle,
  emptyDescription,
  children
}: {
  title?: string
toolbar?: ReactNode
  isEmpty: boolean
  emptyTitle: string
  emptyDescription: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader className={title ? undefined : 'gap-4'}>
        {title ? <CardTitle>{title}</CardTitle> : null}
        {toolbar}
      </CardHeader>
      <CardContent className="px-0">
        {isEmpty ? <EmptyState title={emptyTitle} description={emptyDescription} /> : children}
      </CardContent>
    </Card>
  )
}

export function RecordIdentity({
  title,
  subtitle,
  avatar
}: {
  title: string
  subtitle?: string
  avatar?: string
}) {
  return (
    <div className={avatar ? 'flex items-center gap-3' : undefined}>
      {avatar ? (
        <span className="grid size-9 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
          {avatar}
        </span>
      ) : null}
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        {subtitle ? <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export function ProgressCell({ value, pendingLabel }: { value: number; pendingLabel?: string }) {
  if (pendingLabel) return <span className="text-slate-400">{pendingLabel}</span>
  return (
    <div className="flex items-center gap-3">
      <Progress value={value} />
      <span className="w-9 text-xs font-semibold text-slate-600">{value}%</span>
    </div>
  )
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  variant = 'inset'
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string; count?: number }>
  variant?: 'inset' | 'outlined'
}) {
  return (
    <div
      className={
        variant === 'outlined'
          ? 'flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-fit'
          : 'flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 sm:w-fit'
      }
    >
      {options.map(option => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-semibold transition',
              variant === 'outlined' && 'rounded-lg px-4',
              active
                ? variant === 'outlined'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800',
              !active && variant === 'outlined' && 'hover:bg-slate-50'
            )}
          >
            {option.label}{' '}
            {option.count === undefined ? null : <span className="ml-1 text-xs opacity-70">{option.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

function statusTone(value: string) {
  const normal = value.toLowerCase()
  if (
    normal.includes('compliant') ||
    normal.includes('complete') ||
    normal.includes('closed') ||
    normal.includes('operational') ||
    normal === 'active' ||
    normal === 'excellent' ||
    normal === 'good'
  ) {
    return 'green' as const
  }
  if (
    normal.includes('overdue') ||
    normal.includes('critical') ||
    normal.includes('high') ||
    normal.includes('out of service') ||
    normal.includes('action required') ||
    normal.includes('expired')
  ) {
    return 'red' as const
  }
  if (
    normal.includes('progress') ||
    normal.includes('investigating') ||
    normal.includes('scheduled') ||
    normal.includes('hospital')
  ) {
    return 'blue' as const
  }
  if (normal.includes('medium') || normal.includes('warning') || normal.includes('due') || normal.includes('fair')) {
    return 'amber' as const
  }
  if (normal.includes('caring') || normal.includes('respite')) {
    return 'purple' as const
  }
  return 'slate' as const
}

export function StatusBadge({ value }: { value: string }) {
  return <Badge variant={statusTone(value)}>{value}</Badge>
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  )
}
