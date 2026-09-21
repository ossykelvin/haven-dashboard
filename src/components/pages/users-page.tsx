'use client'

import { FormEvent, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useHavenData } from '@/components/data-provider'
import { PageHeader, RegisterCard, StatCard, StatGrid } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { APP_ROLES } from '@/lib/menus'
import { nativeSelectClassName } from '@/components/shared'

export function UsersPage() {
  const { users, campuses, refresh } = useHavenData()
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
        fullName: form.get('fullName'),
        role: form.get('role'),
        campusId: form.get('campusId')
      })
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) {
      setError(payload?.error || 'Could not create user')
      return
    }
    formEl.reset()
    await refresh()
  }

  return (
    <>
      <PageHeader title="Users" description="Create demonstration accounts on @haven.example only." />
      <StatGrid>
        <StatCard title="Accounts" value={users.length} detail="Activated profiles" icon={UserPlus} />
      </StatGrid>
      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="name@haven.example" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select id="role" name="role" className={nativeSelectClassName} defaultValue="staff">
            {APP_ROLES.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="campusId">Campus</Label>
          <select id="campusId" name="campusId" className={nativeSelectClassName} defaultValue={campuses[0]?.id}>
            {campuses.map(campus => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit">Add user</Button>
        </div>
        {error ? <p className="sm:col-span-2 text-sm font-medium text-rose-700">{error}</p> : null}
      </form>
      <RegisterCard title="Directory" isEmpty={!users.length} emptyTitle="No users" emptyDescription="Create a demonstration account.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Campus</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{campuses.find(campus => campus.id === user.campusId)?.name || '—'}</TableCell>
                <TableCell>{user.isActivated ? 'Active' : 'Inactive'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
