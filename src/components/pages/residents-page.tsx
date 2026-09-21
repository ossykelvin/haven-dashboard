'use client'

import { useMemo, useState } from 'react'
import { BedDouble, CalendarClock, HeartPulse, Plus, Users } from 'lucide-react'
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
import { residentStatusFilterOptions, riskFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { formatDate, initials } from '@/lib/utils'

export function ResidentsPage() {
  const { residents } = useHavenData()
  const [search, setSearch] = useState('')
  const [risk, setRisk] = useState(riskFilterOptions[0])
  const [status, setStatus] = useState(residentStatusFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        residents,
        search,
        resident => [resident.name, resident.room, resident.id],
        [
          resident => matchesSelected(risk, riskFilterOptions[0], resident.risk),
          resident => matchesSelected(status, residentStatusFilterOptions[0], resident.status)
        ]
      ),
    [residents, risk, search, status]
  )

  return (
    <>
      <PageHeader
        title="Residents"
        description="Care-plan assurance, medication reviews, and risk at a glance."
        action={
          <CreateDialog kind="resident">
            <Button>
              <Plus /> Add resident
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard title="Current residents" value={residents.length} detail="91% occupancy" icon={Users} />
        <StatCard
          title="Active in home"
          value={residents.filter(item => item.status === 'Active').length}
          detail="Including permanent placements"
          icon={BedDouble}
          tone="green"
        />
        <StatCard
          title="High risk"
          value={residents.filter(item => item.risk === 'High').length}
          detail="Enhanced oversight in place"
          icon={HeartPulse}
          tone="red"
        />
        <StatCard
          title="Reviews due"
          value={residents.filter(item => item.carePlan === 'Review due').length}
          detail="Before month end"
          icon={CalendarClock}
          tone="amber"
        />
      </StatGrid>

      <RegisterCard
        title="Resident register"
        isEmpty={!filtered.length}
        emptyTitle="No residents found"
        emptyDescription="Try another filter or add a new resident profile."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search resident, room or ID..." />
            <FilterSelect label="Filter by risk" value={risk} onChange={setRisk} options={riskFilterOptions} />
            <FilterSelect
              label="Filter by status"
              value={status}
              onChange={setStatus}
              options={residentStatusFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resident</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Care plan</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Next review</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(resident => (
              <TableRow key={resident.id}>
                <TableCell>
                  <RecordIdentity title={resident.name} subtitle={resident.id} avatar={initials(resident.name)} />
                </TableCell>
                <TableCell className="font-semibold text-slate-700">{resident.room}</TableCell>
                <TableCell>
                  <StatusBadge value={resident.carePlan} />
                </TableCell>
                <TableCell>{resident.medication}</TableCell>
                <TableCell>
                  <StatusBadge value={resident.risk} />
                </TableCell>
                <TableCell>{formatDate(resident.nextReview)}</TableCell>
                <TableCell>
                  <StatusBadge value={resident.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
