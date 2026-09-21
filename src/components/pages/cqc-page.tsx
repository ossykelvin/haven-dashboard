'use client'

import Link from 'next/link'
import { CheckCircle2, ClipboardCheck, FileBarChart, ListChecks, TriangleAlert } from 'lucide-react'
import { useHavenData } from '@/components/data-provider'
import { PageHeader, StatCard, StatGrid, StatusBadge } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { kloeScores } from '@/lib/mock-data'
import { complianceScore, openActionCount } from '@/lib/metrics'
import { KLOES } from '@/lib/constants'

export function CqcPage() {
  const data = useHavenData()
  const score = complianceScore(data)
  const openActions = openActionCount(data)

  return (
    <>
      <PageHeader
        title="CQC"
        description="Inspection-ready assurance across Safe, Effective, Caring, Responsive, and Well-led."
        action={
          <Button asChild variant="outline">
            <Link href="/audits">Open audits</Link>
          </Button>
        }
      />

      <StatGrid>
        <StatCard title="Overall score" value={`${score}%`} detail="From live compliance checks" icon={ListChecks} />
        <StatCard
          title="Open actions"
          value={openActions}
          detail="Checks and audit findings"
          icon={TriangleAlert}
          tone="amber"
        />
        <StatCard
          title="Evidence records"
          value={data.documents.length}
          detail="Policies and certificates"
          icon={FileBarChart}
          tone="violet"
        />
        <StatCard
          title="Audits in programme"
          value={data.audits.length}
          detail="Quality assurance cycle"
          icon={ClipboardCheck}
          tone="blue"
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Key questions</CardTitle>
          <CardDescription>Current KLOE scores and the live checks that sit underneath them</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-5">
          {kloeScores.map(item => {
            const checks = data.complianceChecks.filter(check => check.kloe === item.name)
            return (
              <div key={item.name} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <span
                    className="grid size-8 place-items-center rounded-lg text-white"
                    style={{ backgroundColor: item.colour }}
                  >
                    <CheckCircle2 className="size-4" />
                  </span>
                  <span className="text-2xl font-bold text-slate-900">{item.score}%</span>
                </div>
                <p className="font-semibold text-slate-800">{item.name}</p>
                <Progress value={item.score} className="mt-3 h-1.5" />
                <p className="mt-3 text-xs text-slate-500">{checks.length} linked checks</p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {KLOES.map(kloe => {
          const checks = data.complianceChecks.filter(check => check.kloe === kloe)
          const audits = data.audits.filter(audit => audit.kloe === kloe)
          return (
            <Card key={kloe}>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>{kloe}</CardTitle>
                  <CardDescription>
                    {checks.length} checks · {audits.length} audits
                  </CardDescription>
                </div>
                <Badge variant="blue">{kloe}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {checks.length ? (
                  checks.map(check => (
                    <div key={check.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{check.title}</p>
                        <p className="text-xs text-slate-500">{check.owner}</p>
                      </div>
                      <StatusBadge value={check.status} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No checks mapped to this KLOE yet.</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
