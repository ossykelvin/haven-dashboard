import { NextResponse } from 'next/server'
import { clearSessionCookie, getRequestSession } from '@/lib/server/auth'
import { writeLoginHistory } from '@/lib/server/audit'

export async function POST(request: Request) {
  const session = await getRequestSession()
  if (session) await writeLoginHistory(session.sub, 'logout', request.headers.get('user-agent'))
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
