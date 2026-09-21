import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'
import { isManagerLike, requireMenu, requireSession } from '@/lib/server/auth'
import { writeChangeAudit, writeMedAudit } from '@/lib/server/audit'

const marSchema = z.object({
  medicationId: z.string().min(3),
  status: z.enum(['given', 'refused', 'omitted', 'asleep', 'out', 'unavailable', 'self', 'hospital', 'prn_given', 'not_required']),
  notes: z.string().trim().max(500).optional(),
  doseGiven: z.string().trim().max(80).optional()
})

export async function POST(request: Request) {
  const { session, response } = await requireSession()
  if (!session) return response
  const denied = await requireMenu(session, 'medication')
  if (denied) return denied
  if (!session.isMedCompetent && !isManagerLike(session.roles)) {
    return NextResponse.json({ error: 'Medication competency is required to record a round' }, { status: 403 })
  }
  const parsed = marSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Check the MAR details' }, { status: 400 })

  const medication = await prisma.medication.findFirst({
    where: {
      deletedAt: null,
      campusId: session.campusId ?? undefined,
      OR: [{ id: parsed.data.medicationId }, { refNo: parsed.data.medicationId }]
    }
  })
  if (!medication) return NextResponse.json({ error: 'Medication not found on this campus' }, { status: 404 })

  const row = await prisma.medicationAdministration.create({
    data: {
      id: crypto.randomUUID(),
      medicationId: medication.id,
      residentId: medication.residentId,
      campusId: session.campusId,
      dueAt: new Date(),
      administeredAt: parsed.data.status === 'given' || parsed.data.status === 'prn_given' ? new Date() : null,
      doseGiven: parsed.data.doseGiven || medication.dose,
      status: parsed.data.status,
      notes: parsed.data.notes,
      administeredBy: session.sub,
      isPrn: medication.isPrn
    }
  })
  await writeMedAudit({
    session,
    action: 'administer',
    medicationId: medication.id,
    residentId: medication.residentId,
    newValue: row
  })
  await writeChangeAudit({
    session,
    category: 'create',
    menu: 'medication',
    tableName: 'tbl_medication_administration',
    recordId: row.id,
    newValues: { status: row.status }
  })
  return NextResponse.json(row, { status: 201 })
}
