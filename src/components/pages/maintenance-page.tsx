'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, Plus, TriangleAlert, Wrench } from 'lucide-react'
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
import { maintenanceStatusFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { formatDate } from '@/lib/utils'

export function MaintenancePage() {
  const { maintenanceTasks } = useHavenData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(maintenanceStatusFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        maintenanceTasks,
        search,
        task => [task.title, task.asset, task.owner, task.id],
        [task => matchesSelected(status, maintenanceStatusFilterOptions[0], task.status)]
      ),
    [maintenanceTasks, search, status]
  )

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Plan statutory, PPM, and reactive work against the asset register."
        action={
          <CreateDialog kind="maintenance">
            <Button>
              <Plus /> Add task
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard title="Open tasks" value={maintenanceTasks.length} detail="On the maintenance schedule" icon={Wrench} />
        <StatCard
          title="Scheduled"
          value={maintenanceTasks.filter(item => item.status === 'Scheduled').length}
          detail="Planned work"
          icon={CalendarClock}
          tone="blue"
        />
        <StatCard
          title="Complete"
          value={maintenanceTasks.filter(item => item.status === 'Complete').length}
          detail="Closed this cycle"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          title="Overdue"
          value={maintenanceTasks.filter(item => item.status === 'Overdue').length}
          detail="Needs immediate action"
          icon={TriangleAlert}
          tone="red"
        />
      </StatGrid>

      <RegisterCard
        title="Maintenance schedule"
        isEmpty={!filtered.length}
        emptyTitle="No tasks found"
        emptyDescription="Try another filter or add a maintenance task."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search task, asset or owner..." />
            <FilterSelect
              label="Filter by maintenance status"
              value={status}
              onChange={setStatus}
              options={maintenanceStatusFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(task => (
              <TableRow key={task.id}>
                <TableCell>
                  <RecordIdentity title={task.title} subtitle={task.id} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={task.category} />
                </TableCell>
                <TableCell>{task.asset}</TableCell>
                <TableCell>{task.owner}</TableCell>
                <TableCell>{formatDate(task.dueDate)}</TableCell>
                <TableCell>
                  <StatusBadge value={task.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={task.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
