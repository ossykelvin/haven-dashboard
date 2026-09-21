import { NextResponse } from 'next/server'
import { z } from 'zod'
import { passwordPolicyError } from '@/lib/password-policy'
import { prisma } from '@/lib/server/db'
import { createSessionCookie, verifyPassword } from '@/lib/server/auth'
import { writeLoginHistory } from '@/lib/server/audit'
import { publicSession } from '@/lib/server/session'

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
})

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email and password' }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const user = await prisma.authUser.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    if (user) await writeLoginHistory(user.id, 'failed', request.headers.get('user-agent'))
    return NextResponse.json({ error: 'Those details were not recognised' }, { status: 401 })
  }

  const policy = await prisma.securityPolicy.findFirst()
  const policyError = passwordPolicyError(parsed.data.password, {
    minLength: policy?.minLength ?? 12,
    requireUppercase: policy?.requireUppercase ?? true,
    requireLowercase: policy?.requireLowercase ?? true,
    requireNumber: policy?.requireNumber ?? true,
    requireSymbol: policy?.requireSymbol ?? true
  })
  if (policyError) {
    return NextResponse.json({ error: `Password no longer meets policy: ${policyError}` }, { status: 403 })
  }

  const session = await createSessionCookie(user.id)
  if (!session) return NextResponse.json({ error: 'This account is not active' }, { status: 403 })
  await writeLoginHistory(user.id, 'login', request.headers.get('user-agent'))
  return NextResponse.json({ session: publicSession(session) })
}
