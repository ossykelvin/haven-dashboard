import { NextResponse } from 'next/server'
import { schemas, type CreateKind } from '@/lib/schemas'
import { RECORD_MENUS } from '@/lib/menus'
import { importCsv } from '@/lib/csv'
import { requireMenu } from '@/lib/server/auth'
import { writeChangeAudit } from '@/lib/server/audit'
import { withMenu } from '@/lib/server/route'

export const POST = withMenu('data-import', async (request, session) => {
  const form = await request.formData()
  const kind = String(form.get('kind') || '') as CreateKind
  const file = form.get('file')
  if (!(kind in schemas) || !(file instanceof File)) {
    return NextResponse.json({ error: 'Choose a module and CSV file' }, { status: 400 })
  }
  // The importer writes into the target module, so the caller needs that module's grant too.
  const menuDenied = await requireMenu(session, RECORD_MENUS[kind])
  if (menuDenied) return menuDenied
  const result = await importCsv(kind, await file.text(), session)
  await writeChangeAudit({
    session,
    category: 'import',
    menu: 'data-import',
    tableName: `tbl_${kind}`,
    newValues: result
  })
  return NextResponse.json(result)
})
