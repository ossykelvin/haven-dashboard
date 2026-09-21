import { NextResponse } from 'next/server'
import { hasRole } from '@/lib/menus'
import { prisma } from '@/lib/server/db'
import { withMenu } from '@/lib/server/route'

export const GET = withMenu('change-audit', async (_request, session) => {
  const events = hasRole(session.roles, 'admin')
    ? await prisma.changeAudit.findMany({ orderBy: { eventAt: 'desc' }, take: 200 })
    : await prisma.changeAudit.findMany({
        where: { campusId: session.campusId },
        orderBy: { eventAt: 'desc' },
        take: 200
      })
  return NextResponse.json(events)
})
