'use client'

import { useMemo, useState } from 'react'
import { CalendarCheck, CheckCheck, ClipboardList, ListChecks, Plus } from 'lucide-react'
import { CreateDialog } from '@/components/create-dialog'
import { useHavenData } from '@/components/data-provider'
import {
  FilterBar,
  FilterSelect,
  PageHeader,
  ProgressCell,
  RecordIdentity,
  RegisterCard,
  SearchBox,
  StatCard,
  StatGrid,
  StatusBadge
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { auditStatusFilterOptions, kloeFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { averageCompletedAuditScore, openAuditActions } from '@/lib/metrics'
import { formatDate } from '@/lib/utils'

export function AuditsPage() {
  const { audits } = useHavenData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(auditStatusFilterOptions[0])
  const [kloe, setKloe] = useState(kloeFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        audits,
        search,
        audit => [audit.title, audit.auditor, audit.id],
        [
          audit => matchesSelected(status, auditStatusFilterOptions[0], audit.status),
          audit => matchesSelected(kloe, kloeFilterOptions[0], audit.kloe)
        ]
      ),
    [audits, kloe, search, status]
  )

  return (
    <>
      <PageHeader
        title="Audits"
        description="Schedule assurance reviews, record scores, and manage resulting actions."
        action={
          <CreateDialog kind="audit">
            <Button>
              <Plus /> Schedule audit
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard title="Total audits" value={audits.length} detail="Current assurance cycle" icon={ClipboardList} />
        <StatCard
          title="Scheduled"
          value={audits.filter(item => item.status === 'Scheduled').length}
          detail="Next 30 days"
          icon={CalendarCheck}
          tone="blue"
        />
        <StatCard
          title="Average score"
          value={`${averageCompletedAuditScore({ audits })}%`}
          detail="Across completed audits"
          icon={CheckCheck}
          tone="green"
        />
        <StatCard
          title="Open actions"
          value={openAuditActions({ audits })}
          detail="From recent findings"
          icon={ListChecks}
          tone="amber"
        />
      </StatGrid>

      <RegisterCard
        title="Audit programme"
        isEmpty={!filtered.length}
        emptyTitle="No audits found"
        emptyDescription="Try another filter or schedule a new quality audit."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search audit, auditor or ID..." />
            <FilterSelect label="Filter by CQC KLOE" value={kloe} onChange={setKloe} options={kloeFilterOptions} />
            <FilterSelect
              label="Filter by status"
              value={status}
              onChange={setStatus}
              options={auditStatusFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Audit</TableHead>
              <TableHead>KLOE</TableHead>
              <TableHead>Auditor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="min-w-40">Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(audit => (
              <TableRow key={audit.id}>
                <TableCell>
                  <RecordIdentity title={audit.title} subtitle={audit.id} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={audit.kloe} />
                </TableCell>
                <TableCell>{audit.auditor}</TableCell>
                <TableCell>{formatDate(audit.date)}</TableCell>
                <TableCell>
                  <StatusBadge value={audit.status} />
                </TableCell>
                <TableCell>
                  <ProgressCell value={audit.score} pendingLabel={audit.status === 'Scheduled' ? 'Not started' : undefined} />
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-700">{audit.actions}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
