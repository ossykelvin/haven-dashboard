import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'
import { isManagerLike, requireMenu, requireSession } from '@/lib/server/auth'
import { writeChangeAudit } from '@/lib/server/audit'

const sendSchema = z.object({
  templateName: z.string().min(2),
  recipientLabel: z.string().trim().min(2).max(80)
})

export async function POST(request: Request) {
  const { session, response } = await requireSession()
  if (!session) return response
  const denied = await requireMenu(session, 'email-templates')
  if (denied) return denied
  if (!isManagerLike(session.roles)) {
    return NextResponse.json({ error: 'Only admins and managers can queue email' }, { status: 403 })
  }
  const parsed = sendSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Choose a template and recipient label' }, { status: 400 })
  const template = await prisma.emailTemplate.findUnique({ where: { name: parsed.data.templateName } })
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  const log = await prisma.emailSendLog.create({
    data: {
      id: crypto.randomUUID(),
      templateName: template.name,
      recipientEmail: 'logged-recipient@haven.example',
      status: 'logged',
      metadata: { recipientLabel: parsed.data.recipientLabel, subject: template.subject }
    }
  })
  await writeChangeAudit({
    session,
    category: 'create',
    menu: 'email-templates',
    tableName: 'email_send_log',
    recordId: log.id,
    newValues: { template: template.name, status: 'logged' }
  })
  return NextResponse.json(log, { status: 201 })
}
