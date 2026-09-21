import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/server/db'
import { withMenu } from '@/lib/server/route'

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().trim().min(1).max(2000)
})

const startSchema = z.object({
  userId: z.string().uuid()
})

export const POST = withMenu('chat', async (request, session) => {
  const body = await request.json().catch(() => null)
  if (body?.userId) {
    const parsed = startSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Choose a colleague' }, { status: 400 })
    const conversation = await prisma.chatConversation.create({
      data: {
        id: crypto.randomUUID(),
        name: null,
        isGroup: false,
        createdBy: session.sub
      }
    })
    await prisma.chatParticipant.createMany({
      data: [
        { id: crypto.randomUUID(), conversationId: conversation.id, userId: session.sub },
        { id: crypto.randomUUID(), conversationId: conversation.id, userId: parsed.data.userId }
      ]
    })
    return NextResponse.json(conversation, { status: 201 })
  }

  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Message required' }, { status: 400 })
  const participant = await prisma.chatParticipant.findFirst({
    where: { conversationId: parsed.data.conversationId, userId: session.sub }
  })
  if (!participant) return NextResponse.json({ error: 'You are not in this conversation' }, { status: 403 })
  const message = await prisma.chatMessage.create({
    data: {
      id: crypto.randomUUID(),
      conversationId: parsed.data.conversationId,
      senderId: session.sub,
      content: parsed.data.content
    }
  })
  await prisma.chatConversation.update({
    where: { id: parsed.data.conversationId },
    data: { updatedAt: new Date() }
  })
  return NextResponse.json(message, { status: 201 })
})
