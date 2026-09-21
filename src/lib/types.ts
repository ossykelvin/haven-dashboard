import type {
  AssetCategory,
  AssetCondition,
  AssetStatus,
  AuditStatus,
  DocumentCategory,
  DocumentStatus,
  EmploymentType,
  EnquiryCareType,
  EnquirySource,
  EnquiryStage,
  EnquiryUrgency,
  IncidentStatus,
  Kloe,
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
  MedicationRoute,
  MedicationStatus,
  NotificationPriority,
  NotificationType,
  OperationalRiskLevel,
  RecordStatus,
  ResidentStatus,
  RiskCategory,
  RiskLevel,
  RiskLikelihood,
  RiskRegisterStatus,
  Severity,
  ShiftType,
  StaffStatus,
  TrainingCategory,
  TrainingFrequency,
  TrainingStatus
} from '@/lib/constants'

export type {
  AssetCategory,
  AssetCondition,
  AssetStatus,
  AuditStatus,
  DocumentCategory,
  DocumentStatus,
  EmploymentType,
  EnquiryCareType,
  EnquirySource,
  EnquiryStage,
  EnquiryUrgency,
  IncidentStatus,
  Kloe,
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
  MedicationRoute,
  MedicationStatus,
  NotificationPriority,
  NotificationType,
  OperationalRiskLevel,
  RecordStatus,
  ResidentStatus,
  RiskCategory,
  RiskLevel,
  RiskLikelihood,
  RiskRegisterStatus,
  Severity,
  ShiftType,
  StaffStatus,
  TrainingCategory,
  TrainingFrequency,
  TrainingStatus
}

export interface ComplianceCheck {
  id: string
  title: string
  kloe: Kloe
  owner: string
  dueDate: string
  status: RecordStatus
  progress: number
}

export interface Resident {
  id: string
  name: string
  room: string
  dateOfBirth: string
  carePlan: string
  medication: string
  risk: RiskLevel
  nextReview: string
  status: ResidentStatus
}

export interface StaffMember {
  id: string
  name: string
  role: string
  employment: EmploymentType
  dbsExpiry: string
  nextTraining: string
  supervisionDate: string
  completion: number
  status: StaffStatus
}

export interface Audit {
  id: string
  title: string
  kloe: Kloe
  auditor: string
  date: string
  status: AuditStatus
  score: number
  actions: number
}

export interface Incident {
  id: string
  reference: string
  type: string
  severity: Severity
  status: IncidentStatus
  location: string
  date: string
  time: string
  resident: string
  reporter: string
  summary: string
}

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  serial: string
  purchaseDate: string
  warrantyUntil: string
  lastService: string
  nextService: string
  condition: AssetCondition
  status: AssetStatus
  location: string
}

export interface HavenNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  date: string
  read: boolean
}

export interface Medication {
  id: string
  resident: string
  medicine: string
  dose: string
  route: MedicationRoute
  schedule: string
  status: MedicationStatus
}

export interface RotaShift {
  id: string
  staff: string
  date: string
  start: string
  end: string
  type: ShiftType
}

export interface TrainingCourse {
  id: string
  title: string
  category: TrainingCategory
  frequency: TrainingFrequency
  owner: string
  nextDue: string
  status: TrainingStatus
}

export interface MaintenanceTask {
  id: string
  title: string
  category: MaintenanceCategory
  asset: string
  owner: string
  dueDate: string
  priority: MaintenancePriority
  status: MaintenanceStatus
}

export interface OperationalRisk {
  id: string
  title: string
  category: RiskCategory
  likelihood: RiskLikelihood
  impact: RiskLikelihood
  level: OperationalRiskLevel
  owner: string
  nextReview: string
  status: RiskRegisterStatus
}

export interface EvidenceDocument {
  id: string
  title: string
  category: DocumentCategory
  kloe: Kloe
  owner: string
  reviewDate: string
  status: DocumentStatus
}

export interface Enquiry {
  id: string
  name: string
  source: EnquirySource
  careType: EnquiryCareType
  urgency: EnquiryUrgency
  stage: EnquiryStage
  preferredRoom: string
}

export interface HavenData {
  complianceChecks: ComplianceCheck[]
  residents: Resident[]
  staff: StaffMember[]
  audits: Audit[]
  incidents: Incident[]
  assets: Asset[]
  notifications: HavenNotification[]
  medications: Medication[]
  rotaShifts: RotaShift[]
  trainings: TrainingCourse[]
  maintenanceTasks: MaintenanceTask[]
  risks: OperationalRisk[]
  documents: EvidenceDocument[]
  enquiries: Enquiry[]
}
