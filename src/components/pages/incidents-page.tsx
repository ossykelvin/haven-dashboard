'use client'

import { useMemo, useState } from 'react'
import { AlertOctagon, Clock3, FileWarning, Plus, SearchCheck } from 'lucide-react'
import { CreateDialog } from '@/components/create-dialog'
import { useHavenData } from '@/components/data-provider'
import {
  FilterBar,
  FilterSelect,
  PageHeader,
  RecordIdentity,
  RegisterCard,
  SearchBox,
  SegmentedControl,
  StatCard,
  StatGrid,
  StatusBadge
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { incidentStatusTabs, severityFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { incidentCounts } from '@/lib/metrics'
import { formatDate } from '@/lib/utils'

export function IncidentsPage() {
  const { incidents } = useHavenData()
  const [tab, setTab] = useState<(typeof incidentStatusTabs)[number]>('All')
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState(severityFilterOptions[0])
  const [type, setType] = useState('All types')
  const counts = incidentCounts({ incidents })

  const types = useMemo(
    () => ['All types', ...Array.from(new Set(incidents.map(incident => incident.type)))],
    [incidents]
  )

  const filtered = useMemo(
    () =>
      filterRecords(
        incidents,
        search,
        incident => [incident.reference, incident.resident, incident.location, incident.reporter],
        [
          incident => tab === 'All' || incident.status === tab,
          incident => matchesSelected(severity, severityFilterOptions[0], incident.severity),
          incident => matchesSelected(type, 'All types', incident.type)
        ]
      ),
    [incidents, search, severity, tab, type]
  )

  return (
    <>
      <PageHeader
        title="Incidents"
        description="Report, investigate, and close incidents with clear management oversight."
        action={
          <CreateDialog kind="incident">
            <Button>
              <Plus /> Report incident
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard title="Total incidents" value={counts.total} detail="Recorded this period" icon={FileWarning} />
        <StatCard title="Open" value={counts.open} detail="Awaiting initial action" icon={Clock3} tone="amber" />
        <StatCard
          title="Investigating"
          value={counts.investigating}
          detail="Review in progress"
          icon={SearchCheck}
          tone="blue"
        />
        <StatCard
          title="Critical"
          value={counts.critical}
          detail="Immediate oversight"
          icon={AlertOctagon}
          tone="red"
        />
      </StatGrid>

      <RegisterCard
        isEmpty={!filtered.length}
        emptyTitle="No incidents found"
        emptyDescription="Try another filter or report a new incident."
        toolbar={
          <>
            <SegmentedControl
              value={tab}
              onChange={setTab}
              options={incidentStatusTabs.map(status => ({
                value: status,
                label: status,
                count:
                  status === 'All' ? incidents.length : incidents.filter(incident => incident.status === status).length
              }))}
            />
            <FilterBar>
              <SearchBox value={search} onChange={setSearch} placeholder="Search reference, resident, location..." />
              <FilterSelect
                label="Filter by incident severity"
                value={severity}
                onChange={setSeverity}
                options={severityFilterOptions}
              />
              <FilterSelect label="Filter by incident type" value={type} onChange={setType} options={types} />
            </FilterBar>
          </>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Incident</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Resident / reporter</TableHead>
              <TableHead>Date & time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(incident => (
              <TableRow key={incident.id}>
                <TableCell className="max-w-[260px]">
                  <p className="font-semibold text-slate-800">{incident.reference}</p>
                  <p className="mt-1 max-w-[260px] truncate text-xs text-slate-500" title={incident.summary}>
                    {incident.summary}
                  </p>
                </TableCell>
                <TableCell className="font-medium">{incident.type}</TableCell>
                <TableCell>
                  <StatusBadge value={incident.severity} />
                </TableCell>
                <TableCell>{incident.location}</TableCell>
                <TableCell>
                  <RecordIdentity title={incident.resident} subtitle={`by ${incident.reporter}`} />
                </TableCell>
                <TableCell>
                  <p>{formatDate(incident.date)}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{incident.time}</p>
                </TableCell>
                <TableCell>
                  <StatusBadge value={incident.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
