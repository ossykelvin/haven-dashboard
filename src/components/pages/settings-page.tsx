'use client'

import { useHavenData } from '@/components/data-provider'
import { PageHeader } from '@/components/shared'

export function SettingsPage() {
  const { session } = useHavenData()
  return (
    <>
      <PageHeader title="Settings" description="Session and campus context for the signed-in demonstration user." />
      <dl className="max-w-xl space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
        <div>
          <dt className="text-slate-400">Name</dt>
          <dd className="font-medium text-slate-900">{session?.name}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Email</dt>
          <dd className="font-medium text-slate-900">{session?.email}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Roles</dt>
          <dd className="font-medium text-slate-900">{session?.roles.join(', ')}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Campus</dt>
          <dd className="font-medium text-slate-900">{session?.campusName}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Medication competent</dt>
          <dd className="font-medium text-slate-900">{session?.isMedCompetent ? 'Yes' : 'No'}</dd>
        </div>
      </dl>
    </>
  )
}
