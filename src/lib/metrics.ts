import type { HavenData } from '@/lib/types'

export function complianceScore(data: Pick<HavenData, 'complianceChecks'>) {
  if (!data.complianceChecks.length) return 0
  return Math.round(
    data.complianceChecks.reduce((total, check) => total + check.progress, 0) / data.complianceChecks.length
  )
}

export function openActionCount(data: Pick<HavenData, 'complianceChecks' | 'audits'>) {
  const checks = data.complianceChecks.filter(check => check.status !== 'Compliant').length
  const auditActions = data.audits.reduce((total, audit) => total + audit.actions, 0)
  return checks + auditActions
}

export function unreadNotificationCount(data: Pick<HavenData, 'notifications'>) {
  return data.notifications.filter(notification => !notification.read).length
}

export function incidentCounts(data: Pick<HavenData, 'incidents'>) {
  return {
    total: data.incidents.length,
    open: data.incidents.filter(incident => incident.status === 'Open').length,
    investigating: data.incidents.filter(incident => incident.status === 'Investigating').length,
    critical: data.incidents.filter(incident => incident.severity === 'Critical').length
  }
}

export function openIncidentCount(data: Pick<HavenData, 'incidents'>) {
  return data.incidents.filter(incident => incident.status !== 'Closed').length
}

export function staffCompliancePercent(data: Pick<HavenData, 'staff'>) {
  if (!data.staff.length) return 0
  return Math.round((data.staff.filter(member => member.status === 'Compliant').length / data.staff.length) * 100)
}

export function averageCompletedAuditScore(data: Pick<HavenData, 'audits'>) {
  const completed = data.audits.filter(audit => audit.status === 'Complete')
  if (!completed.length) return 0
  return Math.round(completed.reduce((total, audit) => total + audit.score, 0) / completed.length)
}

export function openAuditActions(data: Pick<HavenData, 'audits'>) {
  return data.audits.reduce((total, audit) => total + audit.actions, 0)
}
