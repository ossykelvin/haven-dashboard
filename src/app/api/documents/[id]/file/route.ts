import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { requireMenu, requireSession } from '@/lib/server/auth'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireSession()
  if (!session) return response
  const denied = await requireMenu(session, 'documents')
  if (denied) return denied
  const { id } = await context.params
  const row = await prisma.document.findFirst({
    where: {
      deletedAt: null,
      campusId: session.campusId,
      OR: [{ id }, { refNo: id }]
    }
  })
  if (!row?.filePath) return NextResponse.json({ error: 'File not found' }, { status: 404 })
  const file = await readFile(/* turbopackIgnore: true */ path.join(process.cwd(), 'uploads', row.filePath))
  return new NextResponse(new Uint8Array(file), {
    headers: {
      'Content-Type': row.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${row.fileName}"`
    }
  })
}
