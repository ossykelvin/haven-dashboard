import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/server/session'

const publicPaths = ['/login', '/api/auth/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (token) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const login = request.nextUrl.clone()
  login.pathname = '/login'
  login.searchParams.set('from', pathname)
  return NextResponse.redirect(login)
}

export const proxyConfig = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
