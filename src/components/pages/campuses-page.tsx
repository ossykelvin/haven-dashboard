'use client'

import { FormEvent, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useHavenData } from '@/components/data-provider'
import { PageHeader, RegisterCard, StatCard, StatGrid } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function CampusesPage() {
  const { campuses, refresh } = useHavenData()
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    const response = await fetch('/api/campuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.get('name'), status: 'active' })
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) {
      setError(payload?.error || 'Could not add campus')
      return
    }
    formEl.reset()
    await refresh()
  }

  return (
    <>
      <PageHeader title="Campuses" description="Each operational table is scoped by campus_id." />
      <StatGrid>
        <StatCard title="Sites" value={campuses.length} detail="Active locations" icon={MapPin} />
      </StatGrid>
      <form onSubmit={submit} className="flex max-w-xl items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex-1 space-y-2">
          <Label htmlFor="name">Campus name</Label>
          <Input id="name" name="name" required placeholder="e.g. Willow Lodge" />
        </div>
        <Button type="submit">Add campus</Button>
      </form>
      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
      <RegisterCard title="Locations" isEmpty={!campuses.length} emptyTitle="No campuses" emptyDescription="Add a site.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Head office</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campuses.map(campus => (
              <TableRow key={campus.id}>
                <TableCell>{campus.name}</TableCell>
                <TableCell>{campus.status}</TableCell>
                <TableCell>{campus.isHeadOffice ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
