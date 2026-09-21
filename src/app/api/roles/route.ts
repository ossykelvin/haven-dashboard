import { NextResponse } from 'next/server'
import { z } from 'zod'
import { APP_ROLES, hasRole } from '@/lib/menus'
import { prisma } from '@/lib/server/db'
import { requireMenu, requireSession } from '@/lib/server/auth'
import { writeChangeAudit } from '@/lib/server/audit'

const grantSchema = z.object({
  role: z.enum(APP_ROLES),
  menuKey: z.string().min(2),
  enabled: z.boolean()
})

export async function GET() {
  const { session, response } = await requireSession()
  if (!session) return response
  const denied = await requireMenu(session, 'roles')
  if (denied) return denied
  const [definitions, menus, grants] = await Promise.all([
    prisma.roleDefinition.findMany(),
    prisma.menuDefinition.findMany({ orderBy: { groupName: 'asc' } }),
    prisma.roleMenu.findMany()
  ])
  return NextResponse.json({ definitions, menus, grants })
}

export async function POST(request: Request) {
  const { session, response } = await requireSession()
  if (!session) return response
  const denied = await requireMenu(session, 'roles')
  if (denied) return denied
  if (!hasRole(session.roles, 'admin')) {
    return NextResponse.json({ error: 'Only admins can change role menus' }, { status: 403 })
  }
  const parsed = grantSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Check the role grant' }, { status: 400 })
  if (parsed.data.enabled) {
    await prisma.roleMenu.upsert({
      where: { role_menuKey: { role: parsed.data.role, menuKey: parsed.data.menuKey } },
      update: {},
      create: { id: crypto.randomUUID(), role: parsed.data.role, menuKey: parsed.data.menuKey }
    })
  } else {
    await prisma.roleMenu.deleteMany({ where: { role: parsed.data.role, menuKey: parsed.data.menuKey } })
  }
  await writeChangeAudit({
    session,
    category: 'update',
    menu: 'roles',
    tableName: 'tbl_role_menu',
    newValues: parsed.data
  })
  return NextResponse.json({ ok: true })
}
