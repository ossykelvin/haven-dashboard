'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, ClipboardCheck, Clock3, Plus, TriangleAlert } from 'lucide-react'
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
import { complianceStatusFilterOptions, kloeFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { formatDate } from '@/lib/utils'

export function CompliancePage() {
  const { complianceChecks } = useHavenData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(complianceStatusFilterOptions[0])
  const [kloe, setKloe] = useState(kloeFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        complianceChecks,
        search,
        check => [check.title, check.owner, check.id],
        [
          check => matchesSelected(status, complianceStatusFilterOptions[0], check.status),
          check => matchesSelected(kloe, kloeFilterOptions[0], check.kloe)
        ]
      ),
    [complianceChecks, kloe, search, status]
  )

  return (
    <>
      <PageHeader
        title="Compliance checks"
        description="Track assurance evidence and actions against CQC expectations."
        action={
          <CreateDialog kind="compliance">
            <Button>
              <Plus /> Add check
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard
          title="Total checks"
          value={complianceChecks.length}
          detail="Across five KLOEs"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Compliant"
          value={complianceChecks.filter(item => item.status === 'Compliant').length}
          detail="Evidence complete"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          title="In progress"
          value={complianceChecks.filter(item => item.status === 'In progress').length}
          detail="Owned by your team"
          icon={Clock3}
          tone="blue"
        />
        <StatCard
          title="Needs attention"
          value={complianceChecks.filter(item => ['Action required', 'Overdue'].includes(item.status)).length}
          detail="Review priority actions"
          icon={TriangleAlert}
          tone="red"
        />
      </StatGrid>

      <RegisterCard
        title="Compliance register"
        isEmpty={!filtered.length}
        emptyTitle="No checks found"
        emptyDescription="Try another filter or add a new compliance check."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search check, owner or reference..." />
            <FilterSelect label="Filter by CQC KLOE" value={kloe} onChange={setKloe} options={kloeFilterOptions} />
            <FilterSelect
              label="Filter by status"
              value={status}
              onChange={setStatus}
              options={complianceStatusFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Check</TableHead>
              <TableHead>KLOE</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="min-w-44">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(check => (
              <TableRow key={check.id}>
                <TableCell>
                  <RecordIdentity title={check.title} subtitle={check.id} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={check.kloe} />
                </TableCell>
                <TableCell>{check.owner}</TableCell>
                <TableCell>{formatDate(check.dueDate)}</TableCell>
                <TableCell>
                  <StatusBadge value={check.status} />
                </TableCell>
                <TableCell>
                  <ProgressCell value={check.progress} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
