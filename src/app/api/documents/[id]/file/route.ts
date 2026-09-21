import { readFile } from 'node:fs/promises'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { withMenu } from '@/lib/server/route'
import { resolveUploadPath } from '@/lib/server/uploads'

export const GET = withMenu<{ params: Promise<{ id: string }> }>(
  'documents',
  async (_request, session, context) => {
    const { id } = await context.params
    const row = await prisma.document.findFirst({
      where: {
        deletedAt: null,
        campusId: session.campusId,
        OR: [{ id }, { refNo: id }]
      }
    })
    if (!row?.filePath) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    const file = await readFile(/* turbopackIgnore: true */ resolveUploadPath(row.filePath))
    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': row.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${row.fileName}"`
      }
    })
  }
)
