'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { z } from 'zod'
import { initialData } from '@/lib/mock-data'
import type {
  assetSchema,
  auditSchema,
  complianceSchema,
  documentSchema,
  enquirySchema,
  incidentSchema,
  maintenanceSchema,
  medicationSchema,
  residentSchema,
  riskSchema,
  rotaSchema,
  staffSchema,
  trainingSchema,
  CreateKind
} from '@/lib/schemas'
import type { HavenData } from '@/lib/types'

export type PublicSession = {
  id: string
  email: string
  name: string
  roles: string[]
  campusId: string | null
  campusName: string
  menus: string[]
  extraCampusIds: string[]
  isHeadOffice: boolean
  isMedCompetent: boolean
}

export type MarAdministration = {
  id: string
  medicationId: string
  residentId: string
  status: string
  dueAt: string
  notes: string | null
  administeredBy: string | null
}

export type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

export type ChatConversation = {
  id: string
  name: string | null
  isGroup: boolean
  createdBy: string
}

export type PublicUser = {
  id: string
  name: string | null
  campusId: string | null
  isActivated: boolean
  accountType: string
}

export type Campus = {
  id: string
  name: string
  status: string
  isHeadOffice: boolean
}

export type ChangeAuditEvent = {
  id: string
  category: string
  menu: string
  tableName: string
  userEmail: string | null
  eventAt: string
}

export type EmailTemplate = {
  id: string
  name: string
  displayName: string
  subject: string
}

export type EnquiryTask = {
  id: string
  enquiryId: string
  title: string
  status: string | null
  dueDate: string | null
}

export type EnquiryVisit = {
  id: string
  enquiryId: string
  visitorName: string | null
  status: string | null
  visitAt: string | null
}

type AddFn<T> = (input: T) => Promise<void>

interface HavenDataContextValue extends HavenData {
  session: PublicSession | null
  loading: boolean
  marAdministrations: MarAdministration[]
  conversations: ChatConversation[]
  messages: ChatMessage[]
  users: PublicUser[]
  campuses: Campus[]
  roleMenus: Array<{ role: string; menuKey: string }>
  auditEvents: ChangeAuditEvent[]
  emailTemplates: EmailTemplate[]
  enquiryTasks: EnquiryTask[]
  enquiryVisits: EnquiryVisit[]
  refresh: () => Promise<void>
  addResident: AddFn<z.infer<typeof residentSchema>>
  addStaff: AddFn<z.infer<typeof staffSchema>>
  addAudit: AddFn<z.infer<typeof auditSchema>>
  addCompliance: AddFn<z.infer<typeof complianceSchema>>
  addIncident: AddFn<z.infer<typeof incidentSchema>>
  addAsset: AddFn<z.infer<typeof assetSchema>>
  addMedication: AddFn<z.infer<typeof medicationSchema>>
  addRotaShift: AddFn<z.infer<typeof rotaSchema>>
  addTraining: AddFn<z.infer<typeof trainingSchema>>
  addMaintenance: AddFn<z.infer<typeof maintenanceSchema>>
  addRisk: AddFn<z.infer<typeof riskSchema>>
  addDocument: AddFn<z.infer<typeof documentSchema>>
  addEnquiry: AddFn<z.infer<typeof enquirySchema>>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

const HavenDataContext = createContext<HavenDataContextValue | null>(null)

async function readError(response: Response) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null
  throw new Error(payload?.error || 'Request failed')
}

export function HavenDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [data, setData] = useState<HavenData>(initialData)
  const [session, setSession] = useState<PublicSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [marAdministrations, setMarAdministrations] = useState<MarAdministration[]>([])
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [users, setUsers] = useState<PublicUser[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [roleMenus, setRoleMenus] = useState<Array<{ role: string; menuKey: string }>>([])
  const [auditEvents, setAuditEvents] = useState<ChangeAuditEvent[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [enquiryTasks, setEnquiryTasks] = useState<EnquiryTask[]>([])
  const [enquiryVisits, setEnquiryVisits] = useState<EnquiryVisit[]>([])

  const refresh = useCallback(async () => {
    if (pathname === '/login') {
      setLoading(false)
      return
    }
    const response = await fetch('/api/bootstrap')
    if (response.status === 401) {
      router.replace('/login')
      setLoading(false)
      return
    }
    if (!response.ok) {
      setLoading(false)
      return
    }
    const payload = await response.json()
    setSession(payload.session)
    setData(payload.data)
    setMarAdministrations(payload.marAdministrations ?? [])
    setConversations(payload.conversations ?? [])
    setMessages(payload.messages ?? [])
    setUsers(payload.users ?? [])
    setCampuses(payload.campuses ?? [])
    setRoleMenus(payload.roleMenus ?? [])
    setAuditEvents(payload.auditEvents ?? [])
    setEmailTemplates(payload.emailTemplates ?? [])
    setEnquiryTasks(payload.enquiryTasks ?? [])
    setEnquiryVisits(payload.enquiryVisits ?? [])
    setLoading(false)
  }, [pathname, router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load server snapshot after mount
    void refresh()
  }, [refresh])

  const postRecord = useCallback(async (kind: CreateKind, input: unknown) => {
    const response = await fetch(`/api/records/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    })
    if (!response.ok) await readError(response)
    await refresh()
  }, [refresh])

  const addResident = useCallback((input: z.infer<typeof residentSchema>) => postRecord('resident', input), [postRecord])
  const addStaff = useCallback((input: z.infer<typeof staffSchema>) => postRecord('staff', input), [postRecord])
  const addAudit = useCallback((input: z.infer<typeof auditSchema>) => postRecord('audit', input), [postRecord])
  const addCompliance = useCallback((input: z.infer<typeof complianceSchema>) => postRecord('compliance', input), [postRecord])
  const addIncident = useCallback((input: z.infer<typeof incidentSchema>) => postRecord('incident', input), [postRecord])
  const addAsset = useCallback((input: z.infer<typeof assetSchema>) => postRecord('asset', input), [postRecord])
  const addMedication = useCallback((input: z.infer<typeof medicationSchema>) => postRecord('medication', input), [postRecord])
  const addRotaShift = useCallback((input: z.infer<typeof rotaSchema>) => postRecord('rota', input), [postRecord])
  const addTraining = useCallback((input: z.infer<typeof trainingSchema>) => postRecord('training', input), [postRecord])
  const addMaintenance = useCallback((input: z.infer<typeof maintenanceSchema>) => postRecord('maintenance', input), [postRecord])
  const addRisk = useCallback((input: z.infer<typeof riskSchema>) => postRecord('risk', input), [postRecord])
  const addDocument = useCallback((input: z.infer<typeof documentSchema>) => postRecord('document', input), [postRecord])
  const addEnquiry = useCallback((input: z.infer<typeof enquirySchema>) => postRecord('enquiry', input), [postRecord])

  const markNotificationRead = useCallback(async (id: string) => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setData(current => ({
      ...current,
      notifications: current.notifications.map(item => (item.id === id ? { ...item, read: true } : item))
    }))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) })
    setData(current => ({
      ...current,
      notifications: current.notifications.map(item => ({ ...item, read: true }))
    }))
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    setData(current => ({
      ...current,
      notifications: current.notifications.filter(item => item.id !== id)
    }))
  }, [])

  const value = useMemo(
    () => ({
      ...data,
      session,
      loading,
      marAdministrations,
      conversations,
      messages,
      users,
      campuses,
      roleMenus,
      auditEvents,
      emailTemplates,
      enquiryTasks,
      enquiryVisits,
      refresh,
      addResident,
      addStaff,
      addAudit,
      addCompliance,
      addIncident,
      addAsset,
      addMedication,
      addRotaShift,
      addTraining,
      addMaintenance,
      addRisk,
      addDocument,
      addEnquiry,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification
    }),
    [
      data,
      session,
      loading,
      marAdministrations,
      conversations,
      messages,
      users,
      campuses,
      roleMenus,
      auditEvents,
      emailTemplates,
      enquiryTasks,
      enquiryVisits,
      refresh,
      addResident,
      addStaff,
      addAudit,
      addCompliance,
      addIncident,
      addAsset,
      addMedication,
      addRotaShift,
      addTraining,
      addMaintenance,
      addRisk,
      addDocument,
      addEnquiry,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification
    ]
  )

  return <HavenDataContext.Provider value={value}>{children}</HavenDataContext.Provider>
}

export function useHavenData() {
  const context = useContext(HavenDataContext)
  if (!context) throw new Error('useHavenData must be used within HavenDataProvider')
  return context
}
