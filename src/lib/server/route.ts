import { NextResponse } from 'next/server'
import type { z } from 'zod'
import { requireMenu, requireSession } from '@/lib/server/auth'
import type { SessionPayload } from '@/lib/server/session'

type Handler<Context> = (
  request: Request,
  session: SessionPayload,
  context: Context
) => Promise<Response> | Response

/**
 * Wrap a route handler so it only runs for a signed-in user who holds `menuKey`.
 *
 * Every guarded handler previously repeated the same session lookup and menu check. Centralising
 * it means a route cannot be added that forgets one half of the pair, and `requireMenu`'s denial
 * logging stays uniform.
 */
export function withMenu<Context = unknown>(menuKey: string, handler: Handler<Context>) {
  return async (request: Request, context: Context) => {
    const { session, response } = await requireSession()
    if (!session) return response
    const denied = await requireMenu(session, menuKey)
    if (denied) return denied
    return handler(request, session, context)
  }
}

/** Wrap a handler that needs a signed-in user but is not gated behind a single menu. */
export function withSession<Context = unknown>(handler: Handler<Context>) {
  return async (request: Request, context: Context) => {
    const { session, response } = await requireSession()
    if (!session) return response
    return handler(request, session, context)
  }
}

/**
 * Parse a JSON request body against `schema`, returning a 400 response instead of throwing.
 *
 * Returns a discriminated result so callers keep narrow types without repeating the
 * `safeParse(await request.json().catch(...))` dance.
 */
export async function parseBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  message: string
): Promise<{ data: T; response?: undefined } | { data?: undefined; response: NextResponse }> {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return { response: NextResponse.json({ error: message }, { status: 400 }) }
  }
  return { data: parsed.data }
}
