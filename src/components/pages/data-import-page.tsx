'use client'

import { FormEvent, useState } from 'react'
import { useHavenData } from '@/components/data-provider'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { nativeSelectClassName } from '@/components/shared'
import type { CreateKind } from '@/lib/schemas'

const modules: Array<{ kind: CreateKind; label: string }> = [
  { kind: 'resident', label: 'Residents' },
  { kind: 'staff', label: 'Staff' },
  { kind: 'asset', label: 'Assets' },
  { kind: 'incident', label: 'Incidents' },
  { kind: 'enquiry', label: 'Enquiries' }
]

export function DataImportPage() {
  const { refresh } = useHavenData()
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResult('')
    const response = await fetch('/api/import', { method: 'POST', body: new FormData(event.currentTarget) })
    const payload = (await response.json().catch(() => null)) as { created?: number; errors?: Array<{ row: number; message: string }>; error?: string } | null
    if (!response.ok) {
      setError(payload?.error || 'Import failed')
      return
    }
    setResult(`Imported ${payload?.created ?? 0} rows${payload?.errors?.length ? `, ${payload.errors.length} skipped` : ''}.`)
    await refresh()
  }

  return (
    <>
      <PageHeader
        title="Data import"
        description="CSV headers can use Haven field names or CompliCare snake_case aliases. Use fictional demonstration rows only."
      />
      <form onSubmit={submit} className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="space-y-2">
          <Label htmlFor="kind">Module</Label>
          <select id="kind" name="kind" className={nativeSelectClassName} defaultValue="resident">
            {modules.map(item => (
              <option key={item.kind} value={item.kind}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">CSV file</Label>
          <input id="file" name="file" type="file" accept=".csv,text/csv" required className="block text-sm" />
        </div>
        <Button type="submit">Import</Button>
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
        {result ? <p className="text-sm font-medium text-emerald-700">{result}</p> : null}
      </form>
    </>
  )
}
