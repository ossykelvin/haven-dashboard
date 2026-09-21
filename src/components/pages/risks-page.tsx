'use client'

import { useMemo, useState } from 'react'
import { Plus, ShieldAlert, ShieldCheck, TriangleAlert, Workflow } from 'lucide-react'
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
import { riskStatusFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { formatDate } from '@/lib/utils'

export function RisksPage() {
  const { risks } = useHavenData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(riskStatusFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        risks,
        search,
        risk => [risk.title, risk.category, risk.owner, risk.id],
        [risk => matchesSelected(status, riskStatusFilterOptions[0], risk.status)]
      ),
    [risks, search, status]
  )

  return (
    <>
      <PageHeader
        title="Risks"
        description="Score likelihood and impact, then keep mitigation reviews in view."
        action={
          <CreateDialog kind="risk">
            <Button>
              <Plus /> Add risk
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard title="Open risks" value={risks.length} detail="On the risk register" icon={ShieldAlert} />
        <StatCard
          title="High / critical"
          value={risks.filter(item => item.level === 'High' || item.level === 'Critical').length}
          detail="Need manager oversight"
          icon={TriangleAlert}
          tone="red"
        />
        <StatCard
          title="Mitigating"
          value={risks.filter(item => item.status === 'Mitigating').length}
          detail="Actions in progress"
          icon={Workflow}
          tone="blue"
        />
        <StatCard
          title="Closed or accepted"
          value={risks.filter(item => item.status === 'Closed' || item.status === 'Accepted').length}
          detail="Reviewed and held"
          icon={ShieldCheck}
          tone="green"
        />
      </StatGrid>

      <RegisterCard
        title="Risk register"
        isEmpty={!filtered.length}
        emptyTitle="No risks found"
        emptyDescription="Try another filter or add a risk."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search risk, category or owner..." />
            <FilterSelect
              label="Filter by risk status"
              value={status}
              onChange={setStatus}
              options={riskStatusFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Risk</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Likelihood</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Next review</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(risk => (
              <TableRow key={risk.id}>
                <TableCell>
                  <RecordIdentity title={risk.title} subtitle={risk.id} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={risk.category} />
                </TableCell>
                <TableCell>{risk.likelihood}</TableCell>
                <TableCell>{risk.impact}</TableCell>
                <TableCell>
                  <StatusBadge value={risk.level} />
                </TableCell>
                <TableCell>{risk.owner}</TableCell>
                <TableCell>{formatDate(risk.nextReview)}</TableCell>
                <TableCell>
                  <StatusBadge value={risk.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
