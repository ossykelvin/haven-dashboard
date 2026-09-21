'use client'

import { useMemo, useState } from 'react'
import { ClipboardList, Inbox, Plus, UserPlus, Users } from 'lucide-react'
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
import { enquirySourceFilterOptions, enquiryStageFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'

export function EnquiriesPage() {
  const { enquiries, enquiryTasks, enquiryVisits } = useHavenData()
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState(enquiryStageFilterOptions[0])
  const [source, setSource] = useState(enquirySourceFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        enquiries,
        search,
        enquiry => [enquiry.name, enquiry.preferredRoom, enquiry.id],
        [
          enquiry => matchesSelected(stage, enquiryStageFilterOptions[0], enquiry.stage),
          enquiry => matchesSelected(source, enquirySourceFilterOptions[0], enquiry.source)
        ]
      ),
    [enquiries, search, source, stage]
  )

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Track prospective admissions from first contact to offered rooms. No contact or health identifiers are stored."
        action={
          <CreateDialog kind="enquiry">
            <Button>
              <Plus /> Add enquiry
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard title="Open enquiries" value={enquiries.length} detail="On the admissions pipeline" icon={Inbox} />
        <StatCard
          title="Assessments / viewings"
          value={enquiries.filter(item => item.stage === 'Assessment' || item.stage === 'Viewing').length}
          detail="In active review"
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          title="Waiting list"
          value={enquiries.filter(item => item.stage === 'Waiting list').length}
          detail="Awaiting a suitable room"
          icon={Users}
          tone="amber"
        />
        <StatCard
          title="Admitted"
          value={enquiries.filter(item => item.stage === 'Admitted').length}
          detail="Converted this period"
          icon={UserPlus}
          tone="green"
        />
      </StatGrid>

      <RegisterCard
        title="Admissions pipeline"
        isEmpty={!filtered.length}
        emptyTitle="No enquiries found"
        emptyDescription="Try another filter or add a new enquiry."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search name, room or ID..." />
            <FilterSelect
              label="Filter by enquiry stage"
              value={stage}
              onChange={setStage}
              options={enquiryStageFilterOptions}
            />
            <FilterSelect
              label="Filter by enquiry source"
              value={source}
              onChange={setSource}
              options={enquirySourceFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prospect</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Care type</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Preferred room</TableHead>
              <TableHead>Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(enquiry => (
              <TableRow key={enquiry.id}>
                <TableCell>
                  <RecordIdentity title={enquiry.name} subtitle={enquiry.id} />
                </TableCell>
                <TableCell>{enquiry.source}</TableCell>
                <TableCell>
                  <StatusBadge value={enquiry.careType} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={enquiry.urgency} />
                </TableCell>
                <TableCell>{enquiry.preferredRoom}</TableCell>
                <TableCell>
                  <StatusBadge value={enquiry.stage} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <RegisterCard title="Follow-up tasks" toolbar={null} isEmpty={!enquiryTasks.length} emptyTitle="No tasks" emptyDescription="Tasks are stored in tbl_enquiry_task.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiryTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <StatusBadge value={task.status || 'Open'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </RegisterCard>
        <RegisterCard title="Viewings" toolbar={null} isEmpty={!enquiryVisits.length} emptyTitle="No viewings" emptyDescription="Visits are stored in tbl_enquiry_visit.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiryVisits.map(visit => (
                <TableRow key={visit.id}>
                  <TableCell>{visit.visitorName || 'Visitor'}</TableCell>
                  <TableCell>
                    <StatusBadge value={visit.status || 'Booked'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </RegisterCard>
      </div>
    </>
  )
}
