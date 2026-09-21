import { NextResponse } from 'next/server'
import { RECORD_MENUS } from '@/lib/menus'
import { firstSchemaError, schemas, type CreateKind } from '@/lib/schemas'
import { requireMenu } from '@/lib/server/auth'
import { createRecord } from '@/lib/server/records'
import { withSession } from '@/lib/server/route'

function isCreateKind(value: string): value is CreateKind {
  return value in schemas
}

// The menu grant depends on the record kind in the path, so this route checks the session first
// and resolves its own menu once the kind is known.
export const POST = withSession<{ params: Promise<{ kind: string }> }>(
  async (request, session, context) => {
    const { kind } = await context.params
    if (!isCreateKind(kind)) {
      return NextResponse.json({ error: 'Unknown record type' }, { status: 404 })
    }
    const denied = await requireMenu(session, RECORD_MENUS[kind])
    if (denied) return denied
    const parsed = schemas[kind].safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: firstSchemaError(parsed.error) }, { status: 400 })
    }
    try {
      const record = await createRecord(kind, parsed.data, session)
      return NextResponse.json(record, { status: 201 })
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Could not save' },
        { status: 400 }
      )
    }
  }
)
