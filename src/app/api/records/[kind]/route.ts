import { NextResponse } from 'next/server'
import { RECORD_MENUS, type MenuKey } from '@/lib/menus'
import { schemas, type CreateKind } from '@/lib/schemas'
import { requireMenu, requireSession } from '@/lib/server/auth'
import { createRecord } from '@/lib/server/records'
import { firstSchemaError } from '@/lib/schemas'

const kinds = Object.keys(schemas) as CreateKind[]

export async function POST(request: Request, context: { params: Promise<{ kind: string }> }) {
  const { session, response } = await requireSession()
  if (!session) return response
  const { kind } = await context.params
  if (!kinds.includes(kind as CreateKind)) {
    return NextResponse.json({ error: 'Unknown record type' }, { status: 404 })
  }
  const menu = RECORD_MENUS[kind as CreateKind] as MenuKey
  const denied = await requireMenu(session, menu)
  if (denied) return denied
  const body = await request.json().catch(() => null)
  const parsed = schemas[kind as CreateKind].safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: firstSchemaError(parsed.error) }, { status: 400 })
  }
  try {
    const record = await createRecord(kind as CreateKind, parsed.data, session)
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save' }, { status: 400 })
  }
}
