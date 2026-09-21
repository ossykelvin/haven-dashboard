import { NextResponse } from 'next/server'
import { getRequestSession, publicSession } from '@/lib/server/auth'

export async function GET() {
  const session = await getRequestSession()
  if (!session) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  return NextResponse.json({ session: publicSession(session) })
}
