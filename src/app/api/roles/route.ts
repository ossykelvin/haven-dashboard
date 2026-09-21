import { NextResponse } from 'next/server'
import { z } from 'zod'
import { APP_ROLES, hasRole } from '@/lib/menus'
import { prisma } from '@/lib/server/db'
import { writeChangeAudit } from '@/lib/server/audit'
import { parseBody, withMenu } from '@/lib/server/route'

const grantSchema = z.object({
  role: z.enum(APP_ROLES),
  menuKey: z.string().min(2),
  enabled: z.boolean()
})

export const GET = withMenu('roles', async () => {
  const [definitions, menus, grants] = await Promise.all([
    prisma.roleDefinition.findMany(),
    prisma.menuDefinition.findMany({ orderBy: { groupName: 'asc' } }),
    prisma.roleMenu.findMany()
  ])
  return NextResponse.json({ definitions, menus, grants })
})

export const POST = withMenu('roles', async (request, session) => {
  if (!hasRole(session.roles, 'admin')) {
    return NextResponse.json({ error: 'Only admins can change role menus' }, { status: 403 })
  }
  const { data, response } = await parseBody(request, grantSchema, 'Check the role grant')
  if (!data) return response
  if (data.enabled) {
    await prisma.roleMenu.upsert({
      where: { role_menuKey: { role: data.role, menuKey: data.menuKey } },
      update: {},
      create: { id: crypto.randomUUID(), role: data.role, menuKey: data.menuKey }
    })
  } else {
    await prisma.roleMenu.deleteMany({ where: { role: data.role, menuKey: data.menuKey } })
  }
  await writeChangeAudit({
    session,
    category: 'update',
    menu: 'roles',
    tableName: 'tbl_role_menu',
    newValues: data
  })
  return NextResponse.json({ ok: true })
})
