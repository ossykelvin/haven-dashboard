'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setPending(true)
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password')
      })
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    setPending(false)
    if (!response.ok) {
      setError(payload?.error || 'Could not sign in')
      return
    }
    router.replace(searchParams.get('from') || '/')
    router.refresh()
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fc] p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-blue-600 text-white">
            <Building2 className="size-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-slate-950">Haven</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Sign in</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">Demonstration accounts use @haven.example. No real care records are stored.</p>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="username" defaultValue="admin@haven.example" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" name="password" autoComplete="current-password" required />
        </div>
        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  )
}
