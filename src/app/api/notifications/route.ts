import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { requireSession } from '@/lib/server/auth'
import { writeChangeAudit } from '@/lib/server/audit'

export async function PATCH(request: Request) {
  const { session, response } = await requireSession()
  if (!session) return response
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
}

export async function DELETE(request: Request) {
  const { session, response } = await requireSession()
  if (!session) return response
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Notification id required' }, { status: 400 })
  await prisma.notification.deleteMany({ where: { id, userId: session.sub } })
  return NextResponse.json({ ok: true })
}
