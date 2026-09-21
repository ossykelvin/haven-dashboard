import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'
import { isManagerLike } from '@/lib/server/auth'
import { writeChangeAudit } from '@/lib/server/audit'
import { parseBody, withMenu } from '@/lib/server/route'

const campusSchema = z.object({
  name: z.string().trim().min(2),
  status: z.enum(['active', 'inactive']).default('active'),
  isHeadOffice: z.boolean().optional()
})

export const GET = withMenu('campuses', async () => {
  const campuses = await prisma.campus.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } })
  return NextResponse.json(campuses)
})

export const POST = withMenu('campuses', async (request, session) => {
  if (!isManagerLike(session.roles)) {
    return NextResponse.json({ error: 'Only admins and managers can add campuses' }, { status: 403 })
  }
  const { data, response } = await parseBody(request, campusSchema, 'Campus name is required')
  if (!data) return response
  const org = await prisma.organization.findFirst()
  if (!org) return NextResponse.json({ error: 'Organisation is not configured' }, { status: 500 })
  const campus = await prisma.campus.create({
    data: {
      id: crypto.randomUUID(),
      name: data.name,
      status: data.status,
      isHeadOffice: data.isHeadOffice ?? false,
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
})
