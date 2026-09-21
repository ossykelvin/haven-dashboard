'use client'

import { useMemo, useState } from 'react'
import { CircleOff, PackageCheck, Plus, ShieldCheck, Wrench } from 'lucide-react'
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
import { assetCategoryFilterOptions, assetStatusFilterOptions } from '@/lib/constants'
import { filterRecords, matchesSelected } from '@/lib/filters'
import { formatDate } from '@/lib/utils'

export function AssetsPage() {
  const { assets } = useHavenData()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(assetCategoryFilterOptions[0])
  const [status, setStatus] = useState(assetStatusFilterOptions[0])

  const filtered = useMemo(
    () =>
      filterRecords(
        assets,
        search,
        asset => [asset.name, asset.serial, asset.location],
        [
          asset => matchesSelected(category, assetCategoryFilterOptions[0], asset.category),
          asset => matchesSelected(status, assetStatusFilterOptions[0], asset.status)
        ]
      ),
    [assets, category, search, status]
  )

  return (
    <>
      <PageHeader
        title="Assets"
        description="Manage medical, safety, mobility, and furniture equipment across the home."
        action={
          <CreateDialog kind="asset">
            <Button>
              <Plus /> Register asset
            </Button>
          </CreateDialog>
        }
      />

      <StatGrid>
        <StatCard title="Registered assets" value={assets.length} detail="Across all locations" icon={PackageCheck} />
        <StatCard
          title="Operational"
          value={assets.filter(item => item.status === 'Operational').length}
          detail="Available for use"
          icon={ShieldCheck}
          tone="green"
        />
        <StatCard
          title="Service due"
          value={assets.filter(item => item.status === 'Service due').length}
          detail="Planned maintenance required"
          icon={Wrench}
          tone="amber"
        />
        <StatCard
          title="Out of service"
          value={assets.filter(item => item.status === 'Out of service').length}
          detail="Unavailable and isolated"
          icon={CircleOff}
          tone="red"
        />
      </StatGrid>

      <RegisterCard
        title="Asset register"
        isEmpty={!filtered.length}
        emptyTitle="No assets found"
        emptyDescription="Try another filter or register new equipment."
        toolbar={
          <FilterBar className="pt-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search asset, serial or location..." />
            <FilterSelect
              label="Filter by asset category"
              value={category}
              onChange={setCategory}
              options={assetCategoryFilterOptions}
            />
            <FilterSelect
              label="Filter by asset status"
              value={status}
              onChange={setStatus}
              options={assetStatusFilterOptions}
            />
          </FilterBar>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Serial</TableHead>
              <TableHead>Purchase / warranty</TableHead>
              <TableHead>Service dates</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(asset => (
              <TableRow key={asset.id}>
                <TableCell>
                  <RecordIdentity title={asset.name} subtitle={asset.id} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={asset.category} />
                </TableCell>
                <TableCell className="font-mono text-xs">{asset.serial}</TableCell>
                <TableCell>
                  <p>{formatDate(asset.purchaseDate)}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Warranty: {formatDate(asset.warrantyUntil)}</p>
                </TableCell>
                <TableCell>
                  <p>Last: {formatDate(asset.lastService)}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Next: {formatDate(asset.nextService)}</p>
                </TableCell>
                <TableCell>
                  <StatusBadge value={asset.condition} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={asset.status} />
                </TableCell>
                <TableCell>{asset.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RegisterCard>
    </>
  )
}
