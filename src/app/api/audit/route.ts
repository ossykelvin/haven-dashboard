import { NextResponse } from 'next/server'
import { hasRole } from '@/lib/menus'
import { prisma } from '@/lib/server/db'
import { requireMenu, requireSession } from '@/lib/server/auth'

export async function GET() {
  const { session, response } = await requireSession()
  if (!session) return response
  const denied = await requireMenu(session, 'change-audit')
  if (denied) return denied
  const events = hasRole(session.roles, 'admin')
    ? await prisma.changeAudit.findMany({ orderBy: { eventAt: 'desc' }, take: 200 })
    : await prisma.changeAudit.findMany({
        where: { campusId: session.campusId },
        orderBy: { eventAt: 'desc' },
        take: 200
      })
  return NextResponse.json(events)
}
