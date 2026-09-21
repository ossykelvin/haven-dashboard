import { NextResponse } from 'next/server'
import { z } from 'zod'
import { APP_ROLES } from '@/lib/menus'
import { passwordPolicyError } from '@/lib/password-policy'
import { prisma } from '@/lib/server/db'
import { hashPassword, isManagerLike } from '@/lib/server/auth'
import { writeChangeAudit } from '@/lib/server/audit'
import { withMenu } from '@/lib/server/route'

const createUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine(value => value.endsWith('@haven.example'), 'Demo accounts must use @haven.example'),
  password: z.string(),
  fullName: z.string().trim().min(2),
  role: z.enum(APP_ROLES),
  campusId: z.string().uuid()
})

export const GET = withMenu('users', async () => {
  const [profiles, roles, emails] = await Promise.all([
    prisma.profile.findMany({ where: { deletedAt: null } }),
    prisma.userRole.findMany(),
    prisma.userEmail.findMany()
  ])
  return NextResponse.json(
    profiles.map(profile => ({
      id: profile.userId,
      name: profile.fullName,
      campusId: profile.campusId,
      isActivated: profile.isActivated,
      accountType: profile.accountType,
      roles: roles.filter(row => row.userId === profile.userId).map(row => row.role),
      email: emails.find(row => row.userId === profile.userId)?.emailLower ?? null
    }))
  )
})

export const POST = withMenu('users', async (request, session) => {
  if (!isManagerLike(session.roles)) {
    return NextResponse.json({ error: 'Only admins and managers can create users' }, { status: 403 })
  }
  const parsed = createUserSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Check the user form' }, { status: 400 })
  }
  const policyError = passwordPolicyError(parsed.data.password)
  if (policyError) return NextResponse.json({ error: policyError }, { status: 400 })
  const email = parsed.data.email.toLowerCase()
  const existing = await prisma.authUser.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'That email is already in use' }, { status: 409 })
  const userId = crypto.randomUUID()
  const passwordHash = await hashPassword(parsed.data.password)
  await prisma.$transaction([
    prisma.authUser.create({ data: { id: userId, email, passwordHash } }),
    prisma.userEmail.create({ data: { userId, emailLower: email } }),
    prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        fullName: parsed.data.fullName,
        isActivated: true,
        campusId: parsed.data.campusId,
        accountType: 'captive'
      }
    }),
    prisma.userRole.create({ data: { id: crypto.randomUUID(), userId, role: parsed.data.role } }),
    prisma.passwordHistory.create({ data: { id: crypto.randomUUID(), userId, passwordHash } })
  ])
  await writeChangeAudit({
    session,
    category: 'create',
    menu: 'users',
    tableName: 'tbl_profile',
    recordId: userId,
    newValues: { email, role: parsed.data.role }
  })
  return NextResponse.json({ id: userId }, { status: 201 })
})
