import { SignJWT, jwtVerify } from 'jose'
import type { AppRole } from '@/lib/menus'

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || 'haven_session'

export type SessionPayload = {
  sub: string
  email: string
  name: string
  roles: AppRole[]
  campusId: string | null
  campusName: string
  menus: string[]
  extraCampusIds: string[]
  isHeadOffice: boolean
  isMedCompetent: boolean
  sessionTimeoutMinutes: number
}

function secretKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

export async function signSession(payload: SessionPayload, maxAgeSeconds: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secretKey())
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (!payload.sub || typeof payload.email !== 'string') return null
    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : 'Haven user',
      roles: Array.isArray(payload.roles) ? (payload.roles as AppRole[]) : [],
      campusId: typeof payload.campusId === 'string' ? payload.campusId : null,
      campusName: typeof payload.campusName === 'string' ? payload.campusName : 'Haven',
      menus: Array.isArray(payload.menus) ? (payload.menus as string[]) : [],
      extraCampusIds: Array.isArray(payload.extraCampusIds) ? (payload.extraCampusIds as string[]) : [],
      isHeadOffice: Boolean(payload.isHeadOffice),
      isMedCompetent: Boolean(payload.isMedCompetent),
      sessionTimeoutMinutes:
        typeof payload.sessionTimeoutMinutes === 'number' ? payload.sessionTimeoutMinutes : 30
    }
  } catch {
    return null
  }
}

export function publicSession(session: SessionPayload) {
  return {
    id: session.sub,
    email: session.email,
    name: session.name,
    roles: session.roles,
    campusId: session.campusId,
    campusName: session.campusName,
    menus: session.menus,
    extraCampusIds: session.extraCampusIds,
    isHeadOffice: session.isHeadOffice,
    isMedCompetent: session.isMedCompetent
  }
}
