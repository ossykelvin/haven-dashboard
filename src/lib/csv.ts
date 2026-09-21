import { RECORD_MENUS } from '@/lib/menus'
import { firstSchemaError, schemas, type CreateKind } from '@/lib/schemas'
import { createRecord } from '@/lib/server/records'
import type { SessionPayload } from '@/lib/server/session'

const headerAliases: Record<string, string> = {
  full_name: 'name',
  room_number: 'room',
  date_of_birth: 'dateOfBirth',
  next_review: 'nextReview',
  employment_type: 'employment',
  dbs_expiry: 'dbsExpiry',
  next_training: 'nextTraining',
  supervision_date: 'supervisionDate',
  due_date: 'dueDate',
  incident_type: 'type',
  serial_number: 'serial',
  purchase_date: 'purchaseDate',
  warranty_expiry: 'warrantyUntil',
  last_service: 'lastService',
  next_service: 'nextService',
  medicine_name: 'medicine',
  shift_date: 'date',
  shift_start: 'start',
  shift_end: 'end',
  shift_type: 'type',
  next_due: 'nextDue',
  next_review_date: 'nextReview',
  review_date: 'reviewDate',
  prospect_full_name: 'name',
  enquiry_type: 'careType',
  preferred_room_type: 'preferredRoom'
}

export function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one data row')
  const headers = splitCsvLine(lines[0]).map(header => headerAliases[header] || header)
  return lines.slice(1).map(line => {
    const cells = splitCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
  })
}

function splitCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      cells.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current.trim())
  return cells
}

export async function importCsv(kind: CreateKind, text: string, session: SessionPayload) {
  const rows = parseCsv(text)
  const schema = schemas[kind]
  const created: unknown[] = []
  const errors: { row: number; message: string }[] = []
  for (const [index, row] of rows.entries()) {
    const parsed = schema.safeParse(row)
    if (!parsed.success) {
      errors.push({ row: index + 2, message: firstSchemaError(parsed.error) })
      continue
    }
    try {
      created.push(await createRecord(kind, parsed.data, session))
    } catch (error) {
      errors.push({ row: index + 2, message: error instanceof Error ? error.message : 'Could not import row' })
    }
  }
  return { module: RECORD_MENUS[kind], created: created.length, errors }
}
