'use client'

import { FormEvent, useState } from 'react'
import { useHavenData } from '@/components/data-provider'
import { PageHeader, RegisterCard } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { nativeSelectClassName } from '@/components/shared'

export function EmailsPage() {
  const { emailTemplates, refresh } = useHavenData()
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    const response = await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateName: form.get('templateName'),
        recipientLabel: form.get('recipientLabel')
      })
    })
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) {
      setError(payload?.error || 'Could not log email')
      return
    }
    formEl.reset()
    await refresh()
  }

  return (
    <>
      <PageHeader
        title="Emails"
        description="Templates are stored in MySQL. Without SMTP, sends are written to email_send_log only."
      />
      <form onSubmit={submit} className="grid max-w-2xl gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="templateName">Template</Label>
          <select id="templateName" name="templateName" className={nativeSelectClassName}>
            {emailTemplates.map(template => (
              <option key={template.id} value={template.name}>
                {template.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipientLabel">Recipient label</Label>
          <Input id="recipientLabel" name="recipientLabel" placeholder="Registered manager" required />
        </div>
        <Button type="submit">Log send</Button>
        {error ? <p className="sm:col-span-2 text-sm font-medium text-rose-700">{error}</p> : null}
      </form>
      <RegisterCard title="Templates" isEmpty={!emailTemplates.length} emptyTitle="No templates" emptyDescription="Seed data adds a demonstration template.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emailTemplates.map(template => (
              <TableRow key={template.id}>
                <TableCell>{template.displayName}</TableCell>
                <TableCell>{template.subject}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
