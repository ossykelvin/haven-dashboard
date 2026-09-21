import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/server/db'
import { canAccessCampus, hasMenuAccess, hasRole, type AppRole } from '@/lib/menus'
import {
  SESSION_COOKIE,
  publicSession,
  signSession,
  verifySession,
  type SessionPayload
} from '@/lib/server/session'

export { publicSession }

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function loadSessionForUser(userId: string): Promise<SessionPayload | null> {
  const [authUser, profile, roleRows, accessRows] = await Promise.all([
    prisma.authUser.findUnique({ where: { id: userId } }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.userRole.findMany({ where: { userId } }),
    prisma.userCampusAccess.findMany({ where: { userId } })
  ])
  if (!authUser || !profile || profile.deletedAt || !profile.isActivated) return null

  const roles = roleRows.map(row => row.role)
  const campus = profile.campusId
    ? await prisma.campus.findUnique({ where: { id: profile.campusId } })
    : null
  const staff = profile.staffId
    ? await prisma.staffMember.findUnique({ where: { id: profile.staffId } })
    : null
  const menuRows = await prisma.roleMenu.findMany({ where: { role: { in: roles } } })
  const menus = [...new Set(menuRows.map(row => row.menuKey))]

  return {
    sub: authUser.id,
    email: authUser.email,
    name: profile.fullName || authUser.email,
    roles,
    campusId: profile.campusId,
    campusName: campus?.name || 'Haven',
    menus,
    extraCampusIds: accessRows.map(row => row.campusId),
    isHeadOffice: Boolean(campus?.isHeadOffice),
    isMedCompetent: Boolean(staff?.isMedCompetent),
    sessionTimeoutMinutes: profile.sessionTimeoutMinutes
  }
}

export async function createSessionCookie(userId: string) {
  const session = await loadSessionForUser(userId)
  if (!session) return null
  const maxAge = Math.max(5, session.sessionTimeoutMinutes) * 60
  const token = await signSession(session, maxAge)
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge
  })
  return session
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function getRequestSession(): Promise<SessionPayload | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

export async function requireSession(): Promise<
  { session: SessionPayload; response?: undefined } | { session: null; response: NextResponse }
> {
  const session = await getRequestSession()
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }
  }
  return { session }
}

export async function requireMenu(session: SessionPayload, menuKey: string) {
  if (hasMenuAccess(session.menus, menuKey) || hasRole(session.roles, 'admin')) return null
  await prisma.rlsDenialLog.create({
    data: {
      id: crypto.randomUUID(),
      userId: session.sub,
      userEmail: session.email,
      tableName: menuKey,
      operation: 'access',
      payload: { menuKey }
    }
  })
  return NextResponse.json({ error: 'You do not have access to this module' }, { status: 403 })
}

export function requireCampus(session: SessionPayload, campusId?: string | null) {
  const target = campusId ?? session.campusId
  if (canAccessCampus(session.roles, session.campusId, session.extraCampusIds, session.isHeadOffice, target)) {
    return target
  }
  return null
}

export function scopedCampusId(session: SessionPayload, requested?: string | null) {
  if (hasRole(session.roles, 'admin') && requested) return requested
  return session.campusId
}

export function isManagerLike(roles: readonly AppRole[]) {
  return hasRole(roles, 'admin') || hasRole(roles, 'manager')
}
