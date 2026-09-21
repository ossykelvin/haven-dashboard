import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { requireMenu, requireSession } from '@/lib/server/auth'
import { writeChangeAudit } from '@/lib/server/audit'

const allowed = new Set(['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])

export async function POST(request: Request) {
  const { session, response } = await requireSession()
  if (!session) return response
  const denied = await requireMenu(session, 'documents')
  if (denied) return denied
  const form = await request.formData()
  const title = String(form.get('title') || '').trim()
  const category = String(form.get('category') || 'Evidence')
  const documentType = String(form.get('kloe') || 'Safe')
  const file = form.get('file')
  if (!title || !(file instanceof File)) {
    return NextResponse.json({ error: 'Title and file are required' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Files must be 10MB or smaller' }, { status: 400 })
  }
  if (file.type && !allowed.has(file.type)) {
    return NextResponse.json({ error: 'Use a PDF, PNG, JPEG, or DOCX file' }, { status: 400 })
  }
  const uploadRoot = path.join(process.cwd(), 'uploads')
  await mkdir(/* turbopackIgnore: true */ uploadRoot, { recursive: true })
  const storedName = `${crypto.randomUUID()}${path.extname(file.name)}`
  const relativePath = path.posix.join(session.campusId || 'home', storedName)
  await writeFile(/* turbopackIgnore: true */ path.join(uploadRoot, relativePath), Buffer.from(await file.arrayBuffer()))
  const row = await prisma.document.create({
    data: {
      id: crypto.randomUUID(),
      title,
      category,
      documentType,
      filePath: relativePath.replaceAll('\\', '/'),
      fileName: file.name,
      fileSize: BigInt(file.size),
      mimeType: file.type || null,
      uploadedBy: session.sub,
      campusId: session.campusId,
      notes: session.name
    }
  })
  await writeChangeAudit({
    session,
    category: 'create',
    menu: 'documents',
    tableName: 'tbl_document',
    recordId: row.id,
    newValues: { title, fileName: file.name }
  })
  return NextResponse.json({ id: row.refNo || row.id, title: row.title }, { status: 201 })
}
