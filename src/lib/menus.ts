export const APP_ROLES = ['admin', 'manager', 'staff', 'shift_lead', 'admissions', 'clerk'] as const

export type AppRole = (typeof APP_ROLES)[number]

export const MENU_DEFINITIONS = [
  { menuKey: 'dashboard', label: 'Dashboard', groupName: 'Overview' },
  { menuKey: 'residents', label: 'Residents', groupName: 'Operations' },
  { menuKey: 'rota', label: 'Rota', groupName: 'Operations' },
  { menuKey: 'staff', label: 'Staff', groupName: 'Operations' },
  { menuKey: 'medication', label: 'Medication', groupName: 'Operations' },
  { menuKey: 'my-trainings', label: 'My Trainings', groupName: 'Operations' },
  { menuKey: 'training', label: 'Training', groupName: 'Operations' },
  { menuKey: 'assets', label: 'Assets', groupName: 'Operations' },
  { menuKey: 'maintenance', label: 'Maintenance', groupName: 'Operations' },
  { menuKey: 'chat', label: 'Messages', groupName: 'Operations' },
  { menuKey: 'notifications', label: 'Notifications', groupName: 'Operations' },
  { menuKey: 'enquiries', label: 'Enquiries', groupName: 'Enquiries' },
  { menuKey: 'cqc-checks', label: 'CQC', groupName: 'Compliance' },
  { menuKey: 'compliance', label: 'Compliance Checks', groupName: 'Compliance' },
  { menuKey: 'documents', label: 'Documents', groupName: 'Compliance' },
  { menuKey: 'incidents', label: 'Incidents', groupName: 'Compliance' },
  { menuKey: 'risks', label: 'Risks', groupName: 'Compliance' },
  { menuKey: 'audit', label: 'Audits', groupName: 'Compliance' },
  { menuKey: 'reporting', label: 'Reports', groupName: 'Compliance' },
  { menuKey: 'roles', label: 'Roles', groupName: 'Administration' },
  { menuKey: 'users', label: 'Users', groupName: 'Administration' },
  { menuKey: 'campuses', label: 'Campuses', groupName: 'Administration' },
  { menuKey: 'data-import', label: 'Data Import', groupName: 'Administration' },
  { menuKey: 'email-templates', label: 'Emails', groupName: 'Administration' },
  { menuKey: 'settings', label: 'Settings', groupName: 'Administration' },
  { menuKey: 'change-audit', label: 'Change Audit', groupName: 'Administration' }
] as const

export type MenuKey = (typeof MENU_DEFINITIONS)[number]['menuKey']

const allMenus = MENU_DEFINITIONS.map(item => item.menuKey)

const clinical = [
  'dashboard',
  'residents',
  'rota',
  'medication',
  'my-trainings',
  'maintenance',
  'chat',
  'notifications',
  'incidents',
  'documents'
] as const satisfies ReadonlyArray<MenuKey>

export const ROLE_MENUS: Record<AppRole, readonly MenuKey[]> = {
  admin: allMenus,
  manager: allMenus.filter(key => key !== 'roles'),
  staff: clinical,
  shift_lead: [...clinical, 'staff', 'training', 'assets'],
  admissions: ['dashboard', 'enquiries', 'residents', 'chat', 'notifications', 'documents', 'reporting'],
  clerk: ['dashboard', 'assets', 'maintenance', 'documents', 'notifications', 'chat', 'data-import', 'settings']
}

export const RECORD_MENUS = {
  resident: 'residents',
  staff: 'staff',
  audit: 'audit',
  compliance: 'compliance',
  incident: 'incidents',
  asset: 'assets',
  medication: 'medication',
  rota: 'rota',
  training: 'training',
  maintenance: 'maintenance',
  risk: 'risks',
  document: 'documents',
  enquiry: 'enquiries'
} as const

export function hasRole(roles: readonly string[], role: AppRole) {
  return roles.includes(role)
}

export function hasAnyRole(roles: readonly string[], allowed: readonly AppRole[]) {
  return allowed.some(role => roles.includes(role))
}

export function hasMenuAccess(menus: readonly string[], menuKey: string) {
  return menus.includes(menuKey)
}

export function canAccessCampus(
  roles: readonly string[],
  homeCampusId: string | null,
  extraCampusIds: readonly string[],
  isHeadOffice: boolean,
  campusId: string | null | undefined
) {
  if (hasRole(roles, 'admin')) return true
  if (!campusId) return hasRole(roles, 'manager') || isHeadOffice
  if (hasRole(roles, 'manager') || isHeadOffice) return true
  if (homeCampusId === campusId) return true
  return extraCampusIds.includes(campusId)
}
