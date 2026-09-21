import type { z } from 'zod'
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
  trainingSchema
} from '@/lib/schemas'
import type {
  Asset,
  Audit,
  ComplianceCheck,
  Enquiry,
  EvidenceDocument,
  Incident,
  MaintenanceTask,
  Medication,
  OperationalRisk,
  Resident,
  RotaShift,
  StaffMember,
  TrainingCourse
} from '@/lib/types'
import type { OperationalRiskLevel, RiskLikelihood } from '@/lib/constants'
import { makeId } from '@/lib/utils'

export function createResident(input: z.infer<typeof residentSchema>): Resident {
  return {
    id: makeId('RES'),
    ...input,
    carePlan: 'Up to date',
    medication: 'Reviewed'
  }
}

export function staffCompletion(status: z.infer<typeof staffSchema>['status']) {
  if (status === 'Compliant') return 100
  if (status === 'Due soon') return 80
  return 55
}

export function createStaff(input: z.infer<typeof staffSchema>): StaffMember {
  return {
    id: makeId('STF'),
    ...input,
    completion: staffCompletion(input.status)
  }
}

export function createAudit(input: z.infer<typeof auditSchema>): Audit {
  return {
    id: makeId('AUD'),
    ...input,
    actions: 0
  }
}

export function createCompliance(input: z.infer<typeof complianceSchema>): ComplianceCheck {
  return { id: makeId('CHK'), ...input }
}

export function incidentReference(date: string, existingCount: number) {
  return `INC-${new Date(date).getFullYear()}-${String(existingCount + 119).padStart(3, '0')}`
}

export function createIncident(input: z.infer<typeof incidentSchema>, existingCount: number): Incident {
  return {
    id: makeId('INC'),
    reference: incidentReference(input.date, existingCount),
    ...input
  }
}

export function createAsset(input: z.infer<typeof assetSchema>): Asset {
  return { id: makeId('AST'), ...input }
}

export function createMedication(input: z.infer<typeof medicationSchema>): Medication {
  return { id: makeId('MED'), ...input }
}

export function createRotaShift(input: z.infer<typeof rotaSchema>): RotaShift {
  return { id: makeId('ROT'), ...input }
}

export function createTraining(input: z.infer<typeof trainingSchema>): TrainingCourse {
  return { id: makeId('TRN'), ...input }
}

export function createMaintenance(input: z.infer<typeof maintenanceSchema>): MaintenanceTask {
  return { id: makeId('MNT'), ...input }
}

const riskMatrix: Record<RiskLikelihood, Record<RiskLikelihood, OperationalRiskLevel>> = {
  Low: { Low: 'Low', Medium: 'Low', High: 'Medium' },
  Medium: { Low: 'Low', Medium: 'Medium', High: 'High' },
  High: { Low: 'Medium', Medium: 'High', High: 'Critical' }
}

export function calculatedRiskLevel(likelihood: RiskLikelihood, impact: RiskLikelihood): OperationalRiskLevel {
  return riskMatrix[likelihood][impact]
}

export function createRisk(input: z.infer<typeof riskSchema>): OperationalRisk {
  return {
    id: makeId('RSK'),
    ...input,
    level: calculatedRiskLevel(input.likelihood, input.impact)
  }
}

export function createDocument(input: z.infer<typeof documentSchema>): EvidenceDocument {
  return { id: makeId('DOC'), ...input }
}

export function createEnquiry(input: z.infer<typeof enquirySchema>): Enquiry {
  return { id: makeId('ENQ'), ...input }
}
