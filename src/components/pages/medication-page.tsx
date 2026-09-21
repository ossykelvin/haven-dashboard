'use client'

import { useMemo, useState } from 'react'
import { PauseCircle, Pill, Plus, ShieldCheck, TriangleAlert } from 'lucide-react'
import { CreateDialog } from '@/components/create-dialog'
import { useHavenData } from '@/components/data-provider'
import {
  FilterBar,
  FilterSelect,
  PageHeader,
  RecordIdentity,
  RegisterCard,
  SearchBox,
  StatCard,
  StatGrid,
  StatusBadge
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { medicationStatusFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'

export function MedicationPage() {
  const { medications, marAdministrations, session, refresh } = useHavenData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(medicationStatusFilterOptions[0])
  const [roundError, setRoundError] = useState('')

  const filtered = useMemo(
    () =>
      filterRecords(
        medications,
        search,
        item => [item.resident, item.medicine, item.id],
        [item => matchesSelected(status, medicationStatusFilterOptions[0], item.status)]
      ),
    [medications, search, status]
  )

  return (
    <>
      <PageHeader
        title="Medication"
        description="Demonstration MAR chart for prescribed medicines, doses, and schedules."
        action={
          <CreateDialog kind="medication">
            <Button>
              <Plus /> Add medication
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard title="MAR entries" value={medications.length} detail="Current prescribed items" icon={Pill} />
        <StatCard
          title="Active"
          value={medications.filter(item => item.status === 'Active').length}
          detail="In the current round"
          icon={ShieldCheck}
          tone="green"
        />
        <StatCard
          title="Paused"
          value={medications.filter(item => item.status === 'Paused').length}
          detail="Held pending review"
          icon={PauseCircle}
          tone="amber"
        />
        <StatCard
          title="Discontinued"
          value={medications.filter(item => item.status === 'Discontinued').length}
          detail="Removed from the MAR"
          icon={TriangleAlert}
          tone="red"
        />
      </StatGrid>

      <RegisterCard
        title="Medication administration record"
        isEmpty={!filtered.length}
        emptyTitle="No medicines found"
        emptyDescription="Try another filter or add a medication to the MAR."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search resident, medicine or ID..." />
            <FilterSelect
              label="Filter by medication status"
              value={status}
              onChange={setStatus}
              options={medicationStatusFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resident</TableHead>
              <TableHead>Medicine</TableHead>
              <TableHead>Dose</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <RecordIdentity title={item.resident} subtitle={item.id} />
                </TableCell>
                <TableCell className="font-semibold text-slate-800">{item.medicine}</TableCell>
                <TableCell>{item.dose}</TableCell>
                <TableCell>
                  <StatusBadge value={item.route} />
                </TableCell>
                <TableCell>{item.schedule}</TableCell>
                <TableCell>
                  <StatusBadge value={item.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>

      <RegisterCard title="Today's MAR round" toolbar={null} isEmpty={false} emptyTitle="" emptyDescription="">
        {session?.isMedCompetent || session?.roles.includes('admin') || session?.roles.includes('manager') ? (
          <form
            className="mb-4 grid gap-3 sm:grid-cols-4"
            onSubmit={async event => {
              event.preventDefault()
              setRoundError('')
              const formEl = event.currentTarget
              const form = new FormData(formEl)
              const response = await fetch('/api/mar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  medicationId: form.get('medicationId'),
                  status: form.get('status'),
                  notes: form.get('notes')
                })
              })
              const payload = (await response.json().catch(() => null)) as { error?: string } | null
              if (!response.ok) {
                setRoundError(payload?.error || 'Could not record administration')
                return
              }
              formEl.reset()
              await refresh()
            }}
          >
            <select name="medicationId" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" required>
              {medications.map(item => (
                <option key={item.id} value={item.id}>
                  {item.resident} — {item.medicine}
                </option>
              ))}
            </select>
            <select name="status" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" defaultValue="given">
              {['given', 'refused', 'omitted', 'asleep', 'out'].map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <input name="notes" placeholder="Notes" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
            <Button type="submit">Record round</Button>
          </form>
        ) : (
          <p className="mb-4 text-sm text-slate-500">Medication competency is required to record a round.</p>
        )}
        {roundError ? <p className="mb-3 text-sm font-medium text-rose-700">{roundError}</p> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marAdministrations.slice(0, 12).map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <StatusBadge value={item.status} />
                </TableCell>
                <TableCell>{item.medicationId}</TableCell>
                <TableCell>{item.notes || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
