import { prisma } from '@/lib/server/db'
import type { SessionPayload } from '@/lib/server/session'

export async function writeChangeAudit(input: {
  session: SessionPayload
  category: string
  menu: string
  tableName: string
  recordId?: string | null
  oldValues?: unknown
  newValues?: unknown
}) {
  await prisma.changeAudit.create({
    data: {
      id: crypto.randomUUID(),
      refNo: `AUD-${Date.now().toString(36).toUpperCase()}`,
      category: input.category,
      menu: input.menu,
      tableName: input.tableName,
      recordId: input.recordId ?? null,
      userId: input.session.sub,
      userEmail: input.session.email,
      oldValues: input.oldValues === undefined ? undefined : (input.oldValues as object),
      newValues: input.newValues === undefined ? undefined : (input.newValues as object),
      campusId: input.session.campusId
    }
  })
}

export async function writeLoginHistory(userId: string, eventType: 'login' | 'logout' | 'failed', userAgent?: string | null) {
  await prisma.loginHistory.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      eventType,
      userAgent: userAgent ?? null
    }
  })
}

export async function writeMedAudit(input: {
  session: SessionPayload
  action: string
  medicationId?: string | null
  residentId?: string | null
  previousValue?: unknown
  newValue?: unknown
  reason?: string | null
}) {
  await prisma.medicationAuditLog.create({
    data: {
      id: crypto.randomUUID(),
      userId: input.session.sub,
      residentId: input.residentId ?? null,
      medicationId: input.medicationId ?? null,
      campusId: input.session.campusId,
      action: input.action,
      previousValue: input.previousValue as object | undefined,
      newValue: input.newValue as object | undefined,
      reason: input.reason ?? null
    }
  })
}
