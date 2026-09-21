import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { writeChangeAudit } from '@/lib/server/audit'
import { withSession } from '@/lib/server/route'

export const PATCH = withSession(async (request, session) => {
  const body = (await request.json().catch(() => null)) as { id?: string; all?: boolean } | null
  if (body?.all) {
    await prisma.notification.updateMany({ where: { userId: session.sub }, data: { isRead: true } })
    await writeChangeAudit({
      session,
      category: 'update',
      menu: 'notifications',
      tableName: 'tbl_notification',
      newValues: { allRead: true }
    })
    return NextResponse.json({ ok: true })
  }
  if (!body?.id) return NextResponse.json({ error: 'Notification id required' }, { status: 400 })
  await prisma.notification.updateMany({ where: { id: body.id, userId: session.sub }, data: { isRead: true } })
  return NextResponse.json({ ok: true })
})

export const DELETE = withSession(async (request, session) => {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Notification id required' }, { status: 400 })
  await prisma.notification.deleteMany({ where: { id, userId: session.sub } })
  return NextResponse.json({ ok: true })
})
