'use client'

import { useMemo, useState } from 'react'
import { BadgeCheck, GraduationCap, Plus, TimerReset, TriangleAlert } from 'lucide-react'
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
import { trainingStatusFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { formatDate } from '@/lib/utils'

export function TrainingPage() {
  const { trainings } = useHavenData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(trainingStatusFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        trainings,
        search,
        course => [course.title, course.owner, course.category, course.id],
        [course => matchesSelected(status, trainingStatusFilterOptions[0], course.status)]
      ),
    [search, status, trainings]
  )

  return (
    <>
      <PageHeader
        title="Training"
        description="Track mandatory and specialist courses for workforce compliance."
        action={
          <CreateDialog kind="training">
            <Button>
              <Plus /> Add training
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard title="Courses" value={trainings.length} detail="On the training register" icon={GraduationCap} />
        <StatCard
          title="Current"
          value={trainings.filter(item => item.status === 'Current').length}
          detail="In date"
          icon={BadgeCheck}
          tone="green"
        />
        <StatCard
          title="Due soon"
          value={trainings.filter(item => item.status === 'Due soon').length}
          detail="Refreshers this month"
          icon={TimerReset}
          tone="amber"
        />
        <StatCard
          title="Overdue"
          value={trainings.filter(item => item.status === 'Overdue').length}
          detail="Manager follow-up needed"
          icon={TriangleAlert}
          tone="red"
        />
      </StatGrid>

      <RegisterCard
        title="Training register"
        isEmpty={!filtered.length}
        emptyTitle="No courses found"
        emptyDescription="Try another filter or add a training course."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search course, owner or ID..." />
            <FilterSelect
              label="Filter by training status"
              value={status}
              onChange={setStatus}
              options={trainingStatusFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Next due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(course => (
              <TableRow key={course.id}>
                <TableCell>
                  <RecordIdentity title={course.title} subtitle={course.id} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={course.category} />
                </TableCell>
                <TableCell>{course.frequency}</TableCell>
                <TableCell>{course.owner}</TableCell>
                <TableCell>{formatDate(course.nextDue)}</TableCell>
                <TableCell>
                  <StatusBadge value={course.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
