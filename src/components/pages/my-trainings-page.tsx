'use client'

import { useHavenData } from '@/components/data-provider'
import { PageHeader, RegisterCard, StatCard, StatGrid } from '@/components/shared'
import { GraduationCap } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/shared'
import { formatDate } from '@/lib/utils'

export function MyTrainingsPage() {
  const { trainings, session } = useHavenData()
  const mine = trainings.filter(item => item.owner === session?.name)
  return (
    <>
      <PageHeader title="My trainings" description="Assignments linked to the signed-in staff profile." />
      <StatGrid>
        <StatCard title="Assigned" value={mine.length} detail="Visible to this user" icon={GraduationCap} />
      </StatGrid>
      <RegisterCard title="My courses" isEmpty={!mine.length} emptyTitle="No assignments" emptyDescription="Managers assign training from the Training register.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mine.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.nextDue ? formatDate(item.nextDue) : '—'}</TableCell>
                <TableCell>
                  <StatusBadge value={item.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
