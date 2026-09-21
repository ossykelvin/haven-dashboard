import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  FileBarChart,
  FileText,
  Gauge,
  GraduationCap,
  History,
  Inbox,
  ListChecks,
  Mail,
  MapPin,
  MessageCircle,
  Pill,
  Settings,
  Shield,
  ShieldAlert,
  Stethoscope,
  Upload,
  Users,
  Wrench,
  type LucideIcon
} from 'lucide-react'
import type { ComponentType } from 'react'
import { AssetsPage } from '@/components/pages/assets-page'
import { AuditsPage } from '@/components/pages/audits-page'
import { CampusesPage } from '@/components/pages/campuses-page'
import { ChangeAuditPage } from '@/components/pages/change-audit-page'
import { CompliancePage } from '@/components/pages/compliance-page'
import { CqcPage } from '@/components/pages/cqc-page'
import { DashboardPage } from '@/components/pages/dashboard-page'
import { DataImportPage } from '@/components/pages/data-import-page'
import { DocumentsPage } from '@/components/pages/documents-page'
import { EmailsPage } from '@/components/pages/emails-page'
import { EnquiriesPage } from '@/components/pages/enquiries-page'
import { IncidentsPage } from '@/components/pages/incidents-page'
import { MaintenancePage } from '@/components/pages/maintenance-page'
import { MedicationPage } from '@/components/pages/medication-page'
import { MessagesPage } from '@/components/pages/messages-page'
import { MyTrainingsPage } from '@/components/pages/my-trainings-page'
import { NotificationsPage } from '@/components/pages/notifications-page'
import { ReportsPage } from '@/components/pages/reports-page'
import { ResidentsPage } from '@/components/pages/residents-page'
import { RisksPage } from '@/components/pages/risks-page'
import { RolesPage } from '@/components/pages/roles-page'
import { RotaPage } from '@/components/pages/rota-page'
import { SettingsPage } from '@/components/pages/settings-page'
import { StaffPage } from '@/components/pages/staff-page'
import { TrainingPage } from '@/components/pages/training-page'
import { UsersPage } from '@/components/pages/users-page'
import type { MenuKey } from '@/lib/menus'

export type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  eyebrow: string
  Page: ComponentType
  menuKey: MenuKey
}

export type NavSection = {
  label: string
  items: NavItem[]
}

/**
 * Menus every signed-in user may open regardless of their role grants.
 *
 * `my-trainings` shows only the records owned by the signed-in user, so it is not gated. Keeping
 * the exception here means the sidebar and the page router cannot disagree about it.
 */
export const UNGATED_MENUS: readonly MenuKey[] = ['my-trainings']

export function canOpenMenu(menus: readonly string[], menuKey: MenuKey) {
  return menus.includes(menuKey) || UNGATED_MENUS.includes(menuKey)
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: Gauge, eyebrow: 'Home overview', Page: DashboardPage, menuKey: 'dashboard' }
    ]
  },
  {
    label: 'Operations',
    items: [
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
  },
  {
    label: 'Enquiries',
    items: [
      { name: 'Enquiries', href: '/enquiries', icon: Inbox, eyebrow: 'Admissions pipeline', Page: EnquiriesPage, menuKey: 'enquiries' }
    ]
  },
  {
    label: 'Compliance',
    items: [
      { name: 'CQC', href: '/cqc', icon: ListChecks, eyebrow: 'Inspection readiness', Page: CqcPage, menuKey: 'cqc-checks' },
      { name: 'Compliance Checks', href: '/compliance-checks', icon: ClipboardCheck, eyebrow: 'Quality & compliance', Page: CompliancePage, menuKey: 'compliance' },
      { name: 'Documents', href: '/documents', icon: FileText, eyebrow: 'Evidence register', Page: DocumentsPage, menuKey: 'documents' },
      { name: 'Incidents', href: '/incidents', icon: AlertTriangle, eyebrow: 'Safety management', Page: IncidentsPage, menuKey: 'incidents' },
      { name: 'Risks', href: '/risks', icon: ShieldAlert, eyebrow: 'Risk register', Page: RisksPage, menuKey: 'risks' },
      { name: 'Audits', href: '/audits', icon: CalendarCheck, eyebrow: 'Quality assurance', Page: AuditsPage, menuKey: 'audit' },
      { name: 'Reports', href: '/reports', icon: FileBarChart, eyebrow: 'Insights', Page: ReportsPage, menuKey: 'reporting' }
    ]
  },
  {
    label: 'Administration',
    items: [
      { name: 'Roles', href: '/roles', icon: Shield, eyebrow: 'Menu grants', Page: RolesPage, menuKey: 'roles' },
      { name: 'Users', href: '/users', icon: Users, eyebrow: 'Accounts', Page: UsersPage, menuKey: 'users' },
      { name: 'Campuses', href: '/campuses', icon: MapPin, eyebrow: 'Sites', Page: CampusesPage, menuKey: 'campuses' },
      { name: 'Data Import', href: '/data-import', icon: Upload, eyebrow: 'CSV load', Page: DataImportPage, menuKey: 'data-import' },
      { name: 'Emails', href: '/email-templates', icon: Mail, eyebrow: 'Templates', Page: EmailsPage, menuKey: 'email-templates' },
      { name: 'Settings', href: '/settings', icon: Settings, eyebrow: 'Session', Page: SettingsPage, menuKey: 'settings' },
      { name: 'Change Audit', href: '/change-audit', icon: History, eyebrow: 'Immutable log', Page: ChangeAuditPage, menuKey: 'change-audit' }
    ]
  }
]

export const NAV_ITEMS_BY_PATH: Record<string, NavItem> = Object.fromEntries(
  NAV_SECTIONS.flatMap(section => section.items).map(item => [item.href, item])
)
