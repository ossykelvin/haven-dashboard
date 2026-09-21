import type {
  Asset,
  Audit,
  ComplianceCheck,
  Enquiry,
  EvidenceDocument,
  HavenNotification,
  Incident,
  MaintenanceTask,
  Medication,
  OperationalRisk,
  Resident,
  RotaShift,
  StaffMember,
  TrainingCourse
} from '@/lib/types'
import { calculatedRiskLevel } from '@/lib/records'
import type { RiskLikelihood } from '@/lib/constants'

function dateOnly(value: Date | string | null | undefined) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return value.toISOString().slice(0, 10)
}

function timeOnly(value: Date | string | null | undefined) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 5)
  return value.toISOString().slice(11, 16)
}

function displayStatus(value: string) {
  if (!value) return value
  return value
    .split(/[_-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function mapResident(row: {
  id: string
  refNo: string | null
  fullName: string
  roomNumber: string | null
  dateOfBirth: string | null
  status: string
  riskFlags: unknown
  carePlanEntries?: Array<{ status: string; reviewDate: Date | string | null }>
}): Resident {
  const flags = Array.isArray(row.riskFlags) ? row.riskFlags.map(String) : []
  const risk = flags.includes('High') || flags.includes('high') ? 'High' : flags.includes('Low') || flags.includes('low') ? 'Low' : 'Medium'
  const plan = row.carePlanEntries?.[0]
  return {
    id: row.refNo || row.id,
    name: row.fullName,
    room: row.roomNumber || '',
    dateOfBirth: row.dateOfBirth || '',
    carePlan: (plan?.status as Resident['carePlan']) || 'Up to date',
    medication: 'Reviewed',
    risk,
    nextReview: dateOnly(plan?.reviewDate),
    status: row.status as Resident['status']
  }
}

export function mapStaff(row: {
  id: string
  refNo: string | null
  fullName: string
  role: string
  employmentType: string | null
  status: string
  startDate?: Date | string | null
}): StaffMember {
  const status = row.status as StaffMember['status']
  return {
    id: row.refNo || row.id,
    name: row.fullName,
    role: row.role,
    employment: (row.employmentType as StaffMember['employment']) || 'Permanent',
    dbsExpiry: '',
    nextTraining: '',
    supervisionDate: dateOnly(row.startDate),
    completion: status === 'Compliant' ? 100 : status === 'Due soon' ? 80 : 55,
    status
  }
}

export function mapAudit(row: {
  id: string
  refNo: string | null
  title: string
  scope: string | null
  auditor: string | null
  auditDate: Date
  status: string
  findings: string | null
}): Audit {
  return {
    id: row.refNo || row.id,
    title: row.title,
    kloe: (row.scope as Audit['kloe']) || 'Safe',
    auditor: row.auditor || '',
    date: dateOnly(row.auditDate),
    status: row.status as Audit['status'],
    score: 0,
    actions: row.findings ? 1 : 0
  }
}

export function mapCompliance(row: {
  id: string
  refNo: string | null
  title: string
  category: string
  dueDate: Date
  status: string
  assignedTo: string | null
}): ComplianceCheck {
  const progress = row.status === 'Compliant' ? 100 : row.status === 'Overdue' ? 40 : 70
  return {
    id: row.refNo || row.id,
    title: row.title,
    kloe: row.category as ComplianceCheck['kloe'],
    owner: row.assignedTo || '',
    dueDate: dateOnly(row.dueDate),
    status: row.status as ComplianceCheck['status'],
    progress
  }
}

export function mapIncident(row: {
  id: string
  refNo: string | null
  title: string
  description: string | null
  incidentDate: Date
  severity: string
  status: string
  location: string | null
  incidentType: string
  reporterName: string | null
  residentId: string | null
}): Incident {
  return {
    id: row.id,
    reference: row.refNo || row.id,
    type: row.incidentType,
    severity: row.severity as Incident['severity'],
    status: row.status as Incident['status'],
    location: row.location || '',
    date: dateOnly(row.incidentDate),
    time: timeOnly(row.incidentDate),
    resident: row.title,
    reporter: row.reporterName || '',
    summary: row.description || row.title
  }
}

export function mapAsset(row: {
  id: string
  refNo: string | null
  name: string
  category: string
  serialNumber: string | null
  purchaseDate: Date | null
  warrantyExpiry: Date | null
  nextInspectionDate: Date | null
  status: string
  location: string | null
  notes: string | null
}): Asset {
  return {
    id: row.refNo || row.id,
    name: row.name,
    category: row.category as Asset['category'],
    serial: row.serialNumber || '',
    purchaseDate: dateOnly(row.purchaseDate),
    warrantyUntil: dateOnly(row.warrantyExpiry),
    lastService: dateOnly(row.nextInspectionDate),
    nextService: dateOnly(row.nextInspectionDate),
    condition: 'Good',
    status: row.status as Asset['status'],
    location: row.location || ''
  }
}

export function mapNotification(row: {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
}): HavenNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type as HavenNotification['type'],
    priority: row.type === 'Alert' ? 'High' : row.type === 'Warning' ? 'Medium' : 'Low',
    date: row.createdAt.toISOString(),
    read: row.isRead
  }
}

export function mapMedication(row: {
  id: string
  refNo: string | null
  medicineName: string
  dose: string
  route: string
  frequency: string | null
  status: string
  residentId: string
}, residentName: string): Medication {
  return {
    id: row.refNo || row.id,
    resident: residentName,
    medicine: row.medicineName,
    dose: row.dose,
    route: row.route as Medication['route'],
    schedule: row.frequency || '',
    status: displayStatus(row.status) as Medication['status']
  }
}

export function mapRota(row: {
  id: string
  refNo: string | null
  shiftDate: Date
  shiftStart: string
  shiftEnd: string
  shiftType: string | null
}, staffName: string): RotaShift {
  return {
    id: row.refNo || row.id,
    staff: staffName,
    date: dateOnly(row.shiftDate),
    start: row.shiftStart.slice(0, 5),
    end: row.shiftEnd.slice(0, 5),
    type: (row.shiftType as RotaShift['type']) || 'Early'
  }
}

export function mapTraining(row: {
  id: string
  refNo: string | null
  title: string
  category: string
  frequency: string
  status: string
}, owner: string, nextDue: string): TrainingCourse {
  return {
    id: row.refNo || row.id,
    title: row.title,
    category: row.category as TrainingCourse['category'],
    frequency: row.frequency as TrainingCourse['frequency'],
    owner,
    nextDue,
    status: row.status as TrainingCourse['status']
  }
}

export function mapMaintenance(row: {
  id: string
  refNo: string | null
  title: string
  category: string
  nextDue: Date
  priority: string
  status: string
}, assetName: string, owner: string): MaintenanceTask {
  return {
    id: row.refNo || row.id,
    title: row.title,
    category: row.category as MaintenanceTask['category'],
    asset: assetName,
    owner,
    dueDate: dateOnly(row.nextDue),
    priority: row.priority as MaintenanceTask['priority'],
    status: row.status as MaintenanceTask['status']
  }
}

export function mapRisk(row: {
  id: string
  refNo: string | null
  title: string
  category: string | null
  likelihood: string | null
  impact: string | null
  riskLevel: string | null
  status: string
  owner: string | null
  nextReviewDate: Date | null
}): OperationalRisk {
  const likelihood = (row.likelihood as RiskLikelihood) || 'Low'
  const impact = (row.impact as RiskLikelihood) || 'Low'
  return {
    id: row.refNo || row.id,
    title: row.title,
    category: (row.category as OperationalRisk['category']) || 'Clinical',
    likelihood,
    impact,
    level: (row.riskLevel as OperationalRisk['level']) || calculatedRiskLevel(likelihood, impact),
    owner: row.owner || '',
    nextReview: dateOnly(row.nextReviewDate),
    status: row.status as OperationalRisk['status']
  }
}

export function mapDocument(row: {
  id: string
  refNo: string | null
  title: string
  category: string
  documentType: string
  expiryDate: Date | null
  notes: string | null
  fileName: string
}): EvidenceDocument {
  const expired = row.expiryDate && row.expiryDate < new Date()
  return {
    id: row.refNo || row.id,
    title: row.title,
    category: row.category as EvidenceDocument['category'],
    kloe: (row.documentType as EvidenceDocument['kloe']) || 'Safe',
    owner: row.notes || '',
    reviewDate: dateOnly(row.expiryDate),
    status: expired ? 'Expired' : row.expiryDate ? 'Current' : 'Current'
  }
}

export function mapEnquiry(row: {
  id: string
  refNo: string | null
  prospectFullName: string
  source: string
  enquiryType: string
  urgency: string
  stage: string
  preferredRoomType: string | null
}): Enquiry {
  return {
    id: row.refNo || row.id,
    name: row.prospectFullName,
    source: row.source as Enquiry['source'],
    careType: row.enquiryType as Enquiry['careType'],
    urgency: row.urgency as Enquiry['urgency'],
    stage: row.stage as Enquiry['stage'],
    preferredRoom: row.preferredRoomType || ''
  }
}
