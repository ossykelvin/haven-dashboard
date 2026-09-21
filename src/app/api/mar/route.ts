import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'
import { isManagerLike } from '@/lib/server/auth'
import { writeChangeAudit, writeMedAudit } from '@/lib/server/audit'
import { parseBody, withMenu } from '@/lib/server/route'

const marSchema = z.object({
  medicationId: z.string().min(3),
  status: z.enum([
    'given',
    'refused',
    'omitted',
    'asleep',
    'out',
    'unavailable',
    'self',
    'hospital',
    'prn_given',
    'not_required'
  ]),
  notes: z.string().trim().max(500).optional(),
  doseGiven: z.string().trim().max(80).optional()
})

export const POST = withMenu('medication', async (request, session) => {
  if (!session.isMedCompetent && !isManagerLike(session.roles)) {
    return NextResponse.json({ error: 'Medication competency is required to record a round' }, { status: 403 })
  }
  const { data, response } = await parseBody(request, marSchema, 'Check the MAR details')
  if (!data) return response

  const medication = await prisma.medication.findFirst({
    where: {
      deletedAt: null,
      campusId: session.campusId ?? undefined,
      OR: [{ id: data.medicationId }, { refNo: data.medicationId }]
    }
  })
  if (!medication) return NextResponse.json({ error: 'Medication not found on this campus' }, { status: 404 })

  const administered = data.status === 'given' || data.status === 'prn_given'
  const row = await prisma.medicationAdministration.create({
    data: {
      id: crypto.randomUUID(),
      medicationId: medication.id,
      residentId: medication.residentId,
      campusId: session.campusId,
      dueAt: new Date(),
      administeredAt: administered ? new Date() : null,
      doseGiven: data.doseGiven || medication.dose,
      status: data.status,
      notes: data.notes,
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
})
