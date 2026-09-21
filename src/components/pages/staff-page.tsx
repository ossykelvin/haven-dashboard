'use client'

import { useMemo, useState } from 'react'
import { BadgeCheck, BriefcaseBusiness, GraduationCap, Plus, UserRoundCheck } from 'lucide-react'
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
import { employmentFilterOptions, staffStatusFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { formatDate } from '@/lib/utils'

export function StaffPage() {
  const { staff } = useHavenData()
  const [search, setSearch] = useState('')
  const [employment, setEmployment] = useState(employmentFilterOptions[0])
  const [status, setStatus] = useState(staffStatusFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        staff,
        search,
        member => [member.name, member.role, member.id],
        [
          member => matchesSelected(employment, employmentFilterOptions[0], member.employment),
          member => matchesSelected(status, staffStatusFilterOptions[0], member.status)
        ]
      ),
    [employment, search, staff, status]
  )

  return (
    <>
      <PageHeader
        title="Staff"
        description="Monitor DBS, training, supervision, and workforce compliance."
        action={
          <CreateDialog kind="staff">
            <Button>
              <Plus /> Add staff
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard
          title="Team members"
          value={staff.length}
          detail="Across all employment types"
          icon={BriefcaseBusiness}
        />
        <StatCard
          title="Fully compliant"
          value={staff.filter(item => item.status === 'Compliant').length}
          detail="DBS and training current"
          icon={BadgeCheck}
          tone="green"
        />
        <StatCard
          title="Training due"
          value={staff.filter(item => item.status === 'Due soon').length}
          detail="Within the next 30 days"
          icon={GraduationCap}
          tone="amber"
        />
        <StatCard
          title="Action required"
          value={staff.filter(item => item.status === 'Action required').length}
          detail="Manager follow-up needed"
          icon={UserRoundCheck}
          tone="red"
        />
      </StatGrid>

      <RegisterCard
        title="Workforce compliance"
        isEmpty={!filtered.length}
        emptyTitle="No staff found"
        emptyDescription="Try another filter or add a new staff member."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search name, role or ID..." />
            <FilterSelect
              label="Filter by employment type"
              value={employment}
              onChange={setEmployment}
              options={employmentFilterOptions}
            />
            <FilterSelect
              label="Filter by compliance status"
              value={status}
              onChange={setStatus}
              options={staffStatusFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff member</TableHead>
              <TableHead>Employment</TableHead>
              <TableHead>DBS expiry</TableHead>
              <TableHead>Next training</TableHead>
              <TableHead>Supervision</TableHead>
              <TableHead className="min-w-40">Completion</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(member => (
              <TableRow key={member.id}>
                <TableCell>
                  <RecordIdentity title={member.name} subtitle={member.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={member.employment} />
                </TableCell>
                <TableCell>{formatDate(member.dbsExpiry)}</TableCell>
                <TableCell>{formatDate(member.nextTraining)}</TableCell>
                <TableCell>{formatDate(member.supervisionDate)}</TableCell>
                <TableCell>
                  <ProgressCell value={member.completion} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={member.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
