'use client'

import { useHavenData } from '@/components/data-provider'
import { PageHeader, RegisterCard } from '@/components/shared'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'

export function ChangeAuditPage() {
  const { auditEvents } = useHavenData()
  return (
    <>
      <PageHeader title="Change audit" description="Append-only writes to tbl_change_audit. Rows are not updated or deleted from this screen." />
      <RegisterCard title="Recent events" isEmpty={!auditEvents.length} emptyTitle="No audit events" emptyDescription="Create a record to see an audit row.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Menu</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditEvents.map(event => (
              <TableRow key={event.id}>
                <TableCell>{formatDateTime(event.eventAt)}</TableCell>
                <TableCell>{event.userEmail}</TableCell>
                <TableCell>{event.menu}</TableCell>
                <TableCell>{event.tableName}</TableCell>
                <TableCell>{event.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
