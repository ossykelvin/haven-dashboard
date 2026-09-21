import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'
import { isManagerLike, requireMenu, requireSession } from '@/lib/server/auth'
import { writeChangeAudit } from '@/lib/server/audit'

const campusSchema = z.object({
  name: z.string().trim().min(2),
  status: z.enum(['active', 'inactive']).default('active'),
  isHeadOffice: z.boolean().optional()
})

export async function GET() {
  const { session, response } = await requireSession()
  if (!session) return response
  const denied = await requireMenu(session, 'campuses')
  if (denied) return denied
  const campuses = await prisma.campus.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } })
  return NextResponse.json(campuses)
}

export async function POST(request: Request) {
  const { session, response } = await requireSession()
  if (!session) return response
  const denied = await requireMenu(session, 'campuses')
  if (denied) return denied
  if (!isManagerLike(session.roles)) {
    return NextResponse.json({ error: 'Only admins and managers can add campuses' }, { status: 403 })
  }
  const parsed = campusSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Campus name is required' }, { status: 400 })
  const org = await prisma.organization.findFirst()
  if (!org) return NextResponse.json({ error: 'Organisation is not configured' }, { status: 500 })
  const campus = await prisma.campus.create({
    data: {
      id: crypto.randomUUID(),
      name: parsed.data.name,
      status: parsed.data.status,
      isHeadOffice: parsed.data.isHeadOffice ?? false,
      organizationId: org.id
    }
  })
  await writeChangeAudit({
    session,
    category: 'create',
    menu: 'campuses',
    tableName: 'tbl_campus',
    recordId: campus.id,
    newValues: { name: campus.name }
  })
  return NextResponse.json(campus, { status: 201 })
}
