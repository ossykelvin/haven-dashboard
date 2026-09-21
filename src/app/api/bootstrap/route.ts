import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { getRequestSession, publicSession, requireMenu } from '@/lib/server/auth'
import { loadHavenData } from '@/lib/server/records'
import { mapDocument } from '@/lib/server/mappers'

export async function GET() {
  const session = await getRequestSession()
  if (!session) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const campusId = session.campusId
  const data = await loadHavenData(session)
  const [mar, conversations, participants, messages, users, campuses, roleMenus, audit, templates, emailLog, tasks, visits, documents] =
    await Promise.all([
      campusId
        ? prisma.medicationAdministration.findMany({
            where: { campusId },
            orderBy: { dueAt: 'desc' },
            take: 200
          })
        : [],
      prisma.chatConversation.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.chatParticipant.findMany(),
      prisma.chatMessage.findMany({ orderBy: { createdAt: 'asc' }, take: 200 }),
      prisma.profile.findMany({ where: { deletedAt: null }, orderBy: { fullName: 'asc' } }),
      prisma.campus.findMany({ where: { deletedAt: null } }),
      prisma.roleMenu.findMany(),
      prisma.changeAudit.findMany({ orderBy: { eventAt: 'desc' }, take: 100 }),
      prisma.emailTemplate.findMany({ orderBy: { name: 'asc' } }),
      prisma.emailSendLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      campusId ? prisma.enquiryTask.findMany({ where: { campusId, deletedAt: null } }) : [],
      campusId ? prisma.enquiryVisit.findMany({ where: { campusId, deletedAt: null } }) : [],
      campusId ? prisma.document.findMany({ where: { campusId, deletedAt: null } }) : []
    ])

  const myConvos = new Set(participants.filter(item => item.userId === session.sub).map(item => item.conversationId))
  const forbidden = await requireMenu(session, 'dashboard')
  if (forbidden) return forbidden

  return NextResponse.json({
    session: publicSession(session),
    data,
    marAdministrations: mar,
    conversations: conversations.filter(item => myConvos.has(item.id) || item.createdBy === session.sub),
    participants,
    messages: messages.filter(item => myConvos.has(item.conversationId)),
    users: users.map(user => ({
      id: user.userId,
      name: user.fullName,
      campusId: user.campusId,
      isActivated: user.isActivated,
      accountType: user.accountType
    })),
    campuses,
    roleMenus,
    auditEvents: audit,
    emailTemplates: templates,
    emailLog,
    enquiryTasks: tasks,
    enquiryVisits: visits,
    documentFiles: documents.map(row => ({ ...mapDocument(row), fileName: row.fileName, hasFile: Boolean(row.filePath) }))
  })
}
