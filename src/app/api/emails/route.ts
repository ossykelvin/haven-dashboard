import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'
import { isManagerLike } from '@/lib/server/auth'
import { writeChangeAudit } from '@/lib/server/audit'
import { parseBody, withMenu } from '@/lib/server/route'

const sendSchema = z.object({
  templateName: z.string().min(2),
  recipientLabel: z.string().trim().min(2).max(80)
})

export const POST = withMenu('email-templates', async (request, session) => {
  if (!isManagerLike(session.roles)) {
    return NextResponse.json({ error: 'Only admins and managers can queue email' }, { status: 403 })
  }
  const { data, response } = await parseBody(request, sendSchema, 'Choose a template and recipient label')
  if (!data) return response
  const template = await prisma.emailTemplate.findUnique({ where: { name: data.templateName } })
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  const log = await prisma.emailSendLog.create({
    data: {
      id: crypto.randomUUID(),
      templateName: template.name,
      recipientEmail: 'logged-recipient@haven.example',
      status: 'logged',
      metadata: { recipientLabel: data.recipientLabel, subject: template.subject }
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
})
