'use client'

import { useMemo, useState } from 'react'
import { FileCheck2, FileText, Plus, TimerReset, TriangleAlert } from 'lucide-react'
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
import { documentCategoryFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { formatDate } from '@/lib/utils'

export function DocumentsPage() {
  const { documents, refresh } = useHavenData()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(documentCategoryFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        documents,
        search,
        document => [document.title, document.owner, document.kloe, document.id],
        [document => matchesSelected(category, documentCategoryFilterOptions[0], document.category)]
      ),
    [category, documents, search]
  )

  return (
    <>
      <PageHeader
        title="Documents"
        description="Register policies, certificates, and inspection evidence. Files are stored on the server, not in the browser."
        action={
          <CreateDialog kind="document">
            <Button>
              <Plus /> Add document
            </Button>
          </CreateDialog>
        }
      />

      <form
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4"
        onSubmit={async event => {
          event.preventDefault()
          const formEl = event.currentTarget
          await fetch('/api/documents/upload', { method: 'POST', body: new FormData(formEl) })
          formEl.reset()
          await refresh()
        }}
      >
        <input name="title" required placeholder="Evidence title" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
        <input name="file" type="file" required className="text-sm" />
        <input type="hidden" name="category" value="Evidence" />
        <input type="hidden" name="kloe" value="Safe" />
        <Button type="submit">Upload file</Button>
      </form>

      <StatGrid>
        <StatCard title="Evidence records" value={documents.length} detail="On the document register" icon={FileText} />
        <StatCard
          title="Current"
          value={documents.filter(item => item.status === 'Current').length}
          detail="In-date evidence"
          icon={FileCheck2}
          tone="green"
        />
        <StatCard
          title="Review due"
          value={documents.filter(item => item.status === 'Review due').length}
          detail="Need owner action"
          icon={TimerReset}
          tone="amber"
        />
        <StatCard
          title="Expired"
          value={documents.filter(item => item.status === 'Expired').length}
          detail="Replace before inspection"
          icon={TriangleAlert}
          tone="red"
        />
      </StatGrid>

      <RegisterCard
        title="Evidence register"
        isEmpty={!filtered.length}
        emptyTitle="No documents found"
        emptyDescription="Try another filter or add an evidence record."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search title, owner or KLOE..." />
            <FilterSelect
              label="Filter by document category"
              value={category}
              onChange={setCategory}
              options={documentCategoryFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>KLOE</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Review date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(document => (
              <TableRow key={document.id}>
                <TableCell>
                  <RecordIdentity title={document.title} subtitle={document.id} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={document.category} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={document.kloe} />
                </TableCell>
                <TableCell>{document.owner}</TableCell>
                <TableCell>{formatDate(document.reviewDate)}</TableCell>
                <TableCell>
                  <StatusBadge value={document.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
