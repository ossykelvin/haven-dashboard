'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, Moon, Plus, Sun, Users } from 'lucide-react'
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
import { shiftTypeFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { formatDate } from '@/lib/utils'

export function RotaPage() {
  const { rotaShifts } = useHavenData()
  const [search, setSearch] = useState('')
  const [type, setType] = useState(shiftTypeFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        rotaShifts,
        search,
        shift => [shift.staff, shift.type, shift.id],
        [shift => matchesSelected(type, shiftTypeFilterOptions[0], shift.type)]
      ),
    [rotaShifts, search, type]
  )

  return (
    <>
      <PageHeader
        title="Rota"
        description="Plan day, late, and night cover across the home."
        action={
          <CreateDialog kind="rota">
            <Button>
              <Plus /> Add shift
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard title="Shifts planned" value={rotaShifts.length} detail="Current rota window" icon={CalendarClock} />
        <StatCard
          title="Day cover"
          value={rotaShifts.filter(item => item.type !== 'Night').length}
          detail="Early, late, and long days"
          icon={Sun}
          tone="amber"
        />
        <StatCard
          title="Night cover"
          value={rotaShifts.filter(item => item.type === 'Night').length}
          detail="Overnight nurse and carer cover"
          icon={Moon}
          tone="violet"
        />
        <StatCard
          title="People rostered"
          value={new Set(rotaShifts.map(item => item.staff)).size}
          detail="Unique staff on the rota"
          icon={Users}
          tone="green"
        />
      </StatGrid>

      <RegisterCard
        title="Shift register"
        isEmpty={!filtered.length}
        emptyTitle="No shifts found"
        emptyDescription="Try another filter or add a new shift."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search staff, shift type or ID..." />
            <FilterSelect
              label="Filter by shift type"
              value={type}
              onChange={setType}
              options={shiftTypeFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(shift => (
              <TableRow key={shift.id}>
                <TableCell>
                  <RecordIdentity title={shift.staff} subtitle={shift.id} />
                </TableCell>
                <TableCell>{formatDate(shift.date)}</TableCell>
                <TableCell>{shift.start}</TableCell>
                <TableCell>{shift.end}</TableCell>
                <TableCell>
                  <StatusBadge value={shift.type} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
