'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useHavenData } from '@/components/data-provider'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function MessagesPage() {
  const { conversations, messages, users, session, refresh } = useHavenData()
  const [selected, setSelected] = useState(conversations[0]?.id ?? '')
  const [error, setError] = useState('')
  const thread = useMemo(() => messages.filter(item => item.conversationId === selected), [messages, selected])

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected) return
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: selected, content: form.get('content') })
    })
    if (!response.ok) {
      setError('Could not send')
      return
    }
    formEl.reset()
    await refresh()
  }

  const startChat = async (userId: string) => {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    await refresh()
  }

  return (
    <>
      <PageHeader title="Messages" description="Conversations and messages persist in MySQL and are limited to participants." />
      <div className="grid min-h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-slate-100 lg:border-b-0 lg:border-r">
          {conversations.map(conversation => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelected(conversation.id)}
              className={cn('block w-full px-4 py-3 text-left text-sm', selected === conversation.id ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700')}
            >
              {conversation.name || 'Direct message'}
            </button>
          ))}
          <div className="border-t border-slate-100 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Start a chat</p>
            {users
              .filter(user => user.id !== session?.id)
              .map(user => (
                <Button key={user.id} type="button" variant="ghost" className="w-full justify-start" onClick={() => startChat(user.id)}>
                  {user.name}
                </Button>
              ))}
          </div>
        </aside>
        <div className="flex flex-col">
          <div className="flex-1 space-y-3 p-4">
            {thread.map(message => (
              <div key={message.id} className={cn('max-w-[80%] rounded-2xl px-3 py-2 text-sm', message.senderId === session?.id ? 'ml-auto bg-blue-600 text-white' : 'bg-slate-100 text-slate-800')}>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-slate-100 p-3">
            <Input name="content" placeholder="Write a message" required />
            <Button type="submit">Send</Button>
          </form>
          {error ? <p className="px-3 pb-3 text-sm text-rose-700">{error}</p> : null}
        </div>
      </div>
    </>
  )
}
