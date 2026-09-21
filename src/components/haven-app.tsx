'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileBarChart,
  FileText,
  Gauge,
  GraduationCap,
  History,
  Inbox,
  ListChecks,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Pill,
  CalendarDays,
  Settings,
  Shield,
  ShieldAlert,
  Stethoscope,
  Upload,
  Users,
  Wrench,
  X,
  type LucideIcon
} from 'lucide-react'
import { type ComponentType, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useHavenData } from '@/components/data-provider'
import { cn, initials } from '@/lib/utils'
import { unreadNotificationCount } from '@/lib/metrics'
import { DashboardPage } from '@/components/pages/dashboard-page'
import { CompliancePage } from '@/components/pages/compliance-page'
import { ResidentsPage } from '@/components/pages/residents-page'
import { StaffPage } from '@/components/pages/staff-page'
import { AuditsPage } from '@/components/pages/audits-page'
import { ReportsPage } from '@/components/pages/reports-page'
import { IncidentsPage } from '@/components/pages/incidents-page'
import { AssetsPage } from '@/components/pages/assets-page'
import { NotificationsPage } from '@/components/pages/notifications-page'
import { RotaPage } from '@/components/pages/rota-page'
import { MedicationPage } from '@/components/pages/medication-page'
import { TrainingPage } from '@/components/pages/training-page'
import { MaintenancePage } from '@/components/pages/maintenance-page'
import { RisksPage } from '@/components/pages/risks-page'
import { DocumentsPage } from '@/components/pages/documents-page'
import { EnquiriesPage } from '@/components/pages/enquiries-page'
import { CqcPage } from '@/components/pages/cqc-page'
import { UsersPage } from '@/components/pages/users-page'
import { RolesPage } from '@/components/pages/roles-page'
import { CampusesPage } from '@/components/pages/campuses-page'
import { DataImportPage } from '@/components/pages/data-import-page'
import { EmailsPage } from '@/components/pages/emails-page'
import { ChangeAuditPage } from '@/components/pages/change-audit-page'
import { MessagesPage } from '@/components/pages/messages-page'
import { SettingsPage } from '@/components/pages/settings-page'
import { MyTrainingsPage } from '@/components/pages/my-trainings-page'

type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  eyebrow: string
  Page: ComponentType
  menuKey: string
}

const overviewNav: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Gauge, eyebrow: 'Home overview', Page: DashboardPage, menuKey: 'dashboard' }
]

const operationsNav: NavItem[] = [
  { name: 'Residents', href: '/residents', icon: Users, eyebrow: 'Care records', Page: ResidentsPage, menuKey: 'residents' },
  { name: 'Rota', href: '/rota', icon: CalendarDays, eyebrow: 'Workforce cover', Page: RotaPage, menuKey: 'rota' },
  { name: 'Staff', href: '/staff', icon: Stethoscope, eyebrow: 'Workforce', Page: StaffPage, menuKey: 'staff' },
  { name: 'Medication', href: '/medication', icon: Pill, eyebrow: 'MAR chart', Page: MedicationPage, menuKey: 'medication' },
  { name: 'My Trainings', href: '/my-trainings', icon: GraduationCap, eyebrow: 'My learning', Page: MyTrainingsPage, menuKey: 'my-trainings' },
  { name: 'Training', href: '/training', icon: GraduationCap, eyebrow: 'Workforce learning', Page: TrainingPage, menuKey: 'training' },
  { name: 'Assets', href: '/assets', icon: Wrench, eyebrow: 'Equipment register', Page: AssetsPage, menuKey: 'assets' },
  { name: 'Maintenance', href: '/maintenance', icon: CalendarCheck, eyebrow: 'Planned work', Page: MaintenancePage, menuKey: 'maintenance' },
  { name: 'Messages', href: '/chat', icon: MessageCircle, eyebrow: 'Team messages', Page: MessagesPage, menuKey: 'chat' },
  { name: 'Notifications', href: '/notifications', icon: Bell, eyebrow: 'Updates & alerts', Page: NotificationsPage, menuKey: 'notifications' }
]

const enquiriesNav: NavItem[] = [
  { name: 'Enquiries', href: '/enquiries', icon: Inbox, eyebrow: 'Admissions pipeline', Page: EnquiriesPage, menuKey: 'enquiries' }
]

const complianceNav: NavItem[] = [
  { name: 'CQC', href: '/cqc', icon: ListChecks, eyebrow: 'Inspection readiness', Page: CqcPage, menuKey: 'cqc-checks' },
  {
    name: 'Compliance Checks',
    href: '/compliance-checks',
    icon: ClipboardCheck,
    eyebrow: 'Quality & compliance',
    Page: CompliancePage,
    menuKey: 'compliance'
  },
  { name: 'Documents', href: '/documents', icon: FileText, eyebrow: 'Evidence register', Page: DocumentsPage, menuKey: 'documents' },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle, eyebrow: 'Safety management', Page: IncidentsPage, menuKey: 'incidents' },
  { name: 'Risks', href: '/risks', icon: ShieldAlert, eyebrow: 'Risk register', Page: RisksPage, menuKey: 'risks' },
  { name: 'Audits', href: '/audits', icon: CalendarCheck, eyebrow: 'Quality assurance', Page: AuditsPage, menuKey: 'audit' },
  { name: 'Reports', href: '/reports', icon: FileBarChart, eyebrow: 'Insights', Page: ReportsPage, menuKey: 'reporting' }
]

const adminNav: NavItem[] = [
  { name: 'Roles', href: '/roles', icon: Shield, eyebrow: 'Menu grants', Page: RolesPage, menuKey: 'roles' },
  { name: 'Users', href: '/users', icon: Users, eyebrow: 'Accounts', Page: UsersPage, menuKey: 'users' },
  { name: 'Campuses', href: '/campuses', icon: MapPin, eyebrow: 'Sites', Page: CampusesPage, menuKey: 'campuses' },
  { name: 'Data Import', href: '/data-import', icon: Upload, eyebrow: 'CSV load', Page: DataImportPage, menuKey: 'data-import' },
  { name: 'Emails', href: '/email-templates', icon: Mail, eyebrow: 'Templates', Page: EmailsPage, menuKey: 'email-templates' },
  { name: 'Settings', href: '/settings', icon: Settings, eyebrow: 'Session', Page: SettingsPage, menuKey: 'settings' },
  { name: 'Change Audit', href: '/change-audit', icon: History, eyebrow: 'Immutable log', Page: ChangeAuditPage, menuKey: 'change-audit' }
]

const navSections = [
  { label: 'Overview', items: overviewNav },
  { label: 'Operations', items: operationsNav },
  { label: 'Enquiries', items: enquiriesNav },
  { label: 'Compliance', items: complianceNav },
  { label: 'Administration', items: adminNav }
]

const pagesByPath = Object.fromEntries(navSections.flatMap(section => section.items).map(item => [item.href, item]))

function Navigation({
  items,
  collapsed,
  pathname,
  onNavigate
}: {
  items: NavItem[]
  collapsed: boolean
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-1">
      {items.map(item => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.name : undefined}
            className={cn(
              'group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
              active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
              collapsed && 'justify-center px-0'
            )}
          >
            {active ? <span className="absolute -left-3 h-5 w-1 rounded-r-full bg-blue-600" /> : null}
            <Icon className={cn('size-[18px] shrink-0', active ? 'text-blue-600' : 'text-slate-400')} />
            {!collapsed ? <span>{item.name}</span> : null}
          </Link>
        )
      })}
    </nav>
  )
}

function Sidebar({
  collapsed,
  pathname,
  onCollapse,
  mobile,
  onClose
}: {
  collapsed: boolean
  pathname: string
  onCollapse: () => void
  mobile?: boolean
  onClose?: () => void
}) {
  const { session } = useHavenData()
  const router = useRouter()
  const menus = session?.menus ?? []
  const visibleSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => menus.includes(item.menuKey) || item.menuKey === 'my-trainings')
    }))
    .filter(section => section.items.length)

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200',
        collapsed ? 'w-[76px]' : 'w-[256px]'
      )}
    >
      <div className={cn('flex h-20 items-center border-b border-slate-100 px-5', collapsed && 'justify-center px-0')}>
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={onClose}>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Building2 className="size-5" />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block text-lg font-bold tracking-tight text-slate-950">Haven</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Care compliance
              </span>
            </span>
          ) : null}
        </Link>
        {mobile ? (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={onClose} aria-label="Close navigation">
            <X />
          </Button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {visibleSections.map((section, index) => (
          <div key={section.label}>
            {index ? <div className="my-5 border-t border-slate-100" /> : null}
            {!collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {section.label}
              </p>
            ) : null}
            <Navigation items={section.items} collapsed={collapsed} pathname={pathname} onNavigate={onClose} />
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-3">
        {!collapsed ? (
          <div className="mb-3 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {initials(session?.name || 'H')}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-800">{session?.name || 'Haven user'}</span>
                <span className="block truncate text-xs text-slate-500">{session?.roles.join(', ') || 'Signed in'}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-3 grid place-items-center">
            <span className="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {initials(session?.name || 'H')}
            </span>
          </div>
        )}
        <Button variant="ghost" className={cn('mb-1 w-full', !collapsed && 'justify-start')} onClick={signOut}>
          <LogOut />
          {!collapsed ? 'Sign out' : <span className="sr-only">Sign out</span>}
        </Button>
        {!mobile ? (
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className={cn('w-full', !collapsed && 'justify-start')}
            onClick={onCollapse}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
            {!collapsed ? 'Collapse sidebar' : <span className="sr-only">Expand sidebar</span>}
          </Button>
        ) : null}
      </div>
    </aside>
  )
}

function CurrentPage({ pathname }: { pathname: string }) {
  const { session } = useHavenData()
  const item = pagesByPath[pathname]
  if (!item) return <DashboardPage />
  if (session && !session.menus.includes(item.menuKey) && item.menuKey !== 'my-trainings') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
        You do not have access to this module.
      </div>
    )
  }
  const Page = item.Page
  return <Page />
}

export function HavenApp() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const data = useHavenData()
  const unread = unreadNotificationCount(data)
  const meta = pagesByPath[pathname] ?? pagesByPath['/']

  if (data.loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading Haven…</div>
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar collapsed={collapsed} pathname={pathname} onCollapse={() => setCollapsed(value => !value)} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/30"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-[280px]">
            <Sidebar
              collapsed={false}
              pathname={pathname}
              onCollapse={() => undefined}
              mobile
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div
        className={cn('min-h-screen transition-[margin] duration-200', collapsed ? 'lg:ml-[76px]' : 'lg:ml-[256px]')}
      >
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600">{meta.eyebrow}</p>
            <p className="mt-0.5 font-semibold text-slate-900">{meta.name}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-400">
                {new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
              </p>
              <p className="text-sm font-semibold text-slate-700">{data.session?.campusName || 'Haven'}</p>
            </div>
            <Link
              href="/notifications"
              className="relative grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
              aria-label={`${unread} unread notifications`}
            >
              <Bell className="size-[18px]" />
              {unread ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-5 text-white ring-2 ring-white">
                  {unread}
                </span>
              ) : null}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
          <CurrentPage pathname={pathname} />
        </main>
      </div>
    </div>
  )
}
