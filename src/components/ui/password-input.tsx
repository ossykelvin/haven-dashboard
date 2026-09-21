'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * Password field with a reveal toggle.
 *
 * The toggle is a real button so it is reachable by keyboard, and `type="button"` keeps it from
 * submitting the surrounding form. Visibility is local state only: it is never persisted, and it
 * resets whenever the field is remounted, so a revealed password cannot outlive the screen it was
 * typed on — these fields are used on shared care-home devices.
 */
function PasswordInput({
  className,
  id,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'type'>) {
  const [visible, setVisible] = React.useState(false)
  const Icon = visible ? EyeOff : Eye
  const action = visible ? 'Hide password' : 'Show password'

  return (
    <div className="relative">
      <Input
        {...props}
        id={id}
        type={visible ? 'text' : 'password'}
        // Room for the toggle so long values do not run underneath it.
        className={cn('pr-10', className)}
      />
      <button
        type="button"
        onClick={() => setVisible(current => !current)}
        aria-label={action}
        aria-pressed={visible}
        aria-controls={id}
        title={action}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-slate-400 outline-none transition-colors hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:text-blue-600"
      >
        <Icon className="size-[18px]" aria-hidden="true" />
      </button>
    </div>
  )
}

export { PasswordInput }
