import { z } from 'zod'
import {
  ASSET_CATEGORIES,
  ASSET_CONDITIONS,
  ASSET_STATUSES,
  AUDIT_STATUSES,
  COMPLIANCE_STATUSES,
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUSES,
  EMPLOYMENT_TYPES,
  ENQUIRY_CARE_TYPES,
  ENQUIRY_SOURCES,
  ENQUIRY_STAGES,
  ENQUIRY_URGENCIES,
  INCIDENT_STATUSES,
  KLOES,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_STATUSES,
  MEDICATION_ROUTES,
  MEDICATION_STATUSES,
  RESIDENT_STATUSES,
  RISK_CATEGORIES,
  RISK_LEVELS,
  RISK_LIKELIHOODS,
  RISK_STATUSES,
  SEVERITIES,
  SHIFT_TYPES,
  STAFF_STATUSES,
  TRAINING_CATEGORIES,
  TRAINING_FREQUENCIES,
  TRAINING_STATUSES
} from '@/lib/constants'

const requiredText = (label: string) => z.string().trim().min(2, `${label} is required`)
const dateText = z.string().min(1, 'Choose a date')
const kloeSchema = z.enum(KLOES)

export const residentSchema = z.object({
  name: requiredText('Resident name'),
  room: z.string().trim().min(1, 'Room is required'),
  dateOfBirth: dateText,
  risk: z.enum(RISK_LEVELS),
  nextReview: dateText,
  status: z.enum(RESIDENT_STATUSES)
})

export const staffSchema = z.object({
  name: requiredText('Staff name'),
  role: requiredText('Role'),
  employment: z.enum(EMPLOYMENT_TYPES),
  dbsExpiry: dateText,
  nextTraining: dateText,
  supervisionDate: dateText,
  status: z.enum(STAFF_STATUSES)
})

export const auditSchema = z.object({
  title: requiredText('Audit title'),
  kloe: kloeSchema,
  auditor: requiredText('Auditor'),
  date: dateText,
  status: z.enum(AUDIT_STATUSES),
  score: z.coerce.number().min(0).max(100)
})

export const complianceSchema = z.object({
  title: requiredText('Check title'),
  kloe: kloeSchema,
  owner: requiredText('Owner'),
  dueDate: dateText,
  status: z.enum(COMPLIANCE_STATUSES),
  progress: z.coerce.number().min(0).max(100)
})

export const incidentSchema = z.object({
  type: requiredText('Incident type'),
  severity: z.enum(SEVERITIES),
  status: z.enum(INCIDENT_STATUSES),
  location: requiredText('Location'),
  date: dateText,
  time: z.string().min(1, 'Choose a time'),
  resident: requiredText('Resident'),
  reporter: requiredText('Reporter'),
  summary: z.string().trim().min(10, 'Add a short factual summary')
})

export const assetSchema = z.object({
  name: requiredText('Asset name'),
  category: z.enum(ASSET_CATEGORIES),
  serial: z.string().trim().min(3, 'Serial number is required'),
  purchaseDate: dateText,
  warrantyUntil: dateText,
  lastService: dateText,
  nextService: dateText,
  condition: z.enum(ASSET_CONDITIONS),
  status: z.enum(ASSET_STATUSES),
  location: requiredText('Location')
})

export const medicationSchema = z.object({
  resident: requiredText('Resident'),
  medicine: requiredText('Medicine'),
  dose: z.string().trim().min(1, 'Dose is required'),
  route: z.enum(MEDICATION_ROUTES),
  schedule: requiredText('Schedule'),
  status: z.enum(MEDICATION_STATUSES)
})

export const rotaSchema = z.object({
  staff: requiredText('Staff member'),
  date: dateText,
  start: z.string().min(1, 'Choose a start time'),
  end: z.string().min(1, 'Choose an end time'),
  type: z.enum(SHIFT_TYPES)
})

export const trainingSchema = z.object({
  title: requiredText('Course title'),
  category: z.enum(TRAINING_CATEGORIES),
  frequency: z.enum(TRAINING_FREQUENCIES),
  owner: requiredText('Owner'),
  nextDue: dateText,
  status: z.enum(TRAINING_STATUSES)
})

export const maintenanceSchema = z.object({
  title: requiredText('Task title'),
  category: z.enum(MAINTENANCE_CATEGORIES),
  asset: requiredText('Linked asset'),
  owner: requiredText('Owner'),
  dueDate: dateText,
  priority: z.enum(MAINTENANCE_PRIORITIES),
  status: z.enum(MAINTENANCE_STATUSES)
})

export const riskSchema = z.object({
  title: requiredText('Risk title'),
  category: z.enum(RISK_CATEGORIES),
  likelihood: z.enum(RISK_LIKELIHOODS),
  impact: z.enum(RISK_LIKELIHOODS),
  owner: requiredText('Owner'),
  nextReview: dateText,
  status: z.enum(RISK_STATUSES)
})

export const documentSchema = z.object({
  title: requiredText('Document title'),
  category: z.enum(DOCUMENT_CATEGORIES),
  kloe: kloeSchema,
  owner: requiredText('Owner'),
  reviewDate: dateText,
  status: z.enum(DOCUMENT_STATUSES)
})

export const enquirySchema = z.object({
  name: requiredText('Prospect name'),
  source: z.enum(ENQUIRY_SOURCES),
  careType: z.enum(ENQUIRY_CARE_TYPES),
  urgency: z.enum(ENQUIRY_URGENCIES),
  stage: z.enum(ENQUIRY_STAGES),
  preferredRoom: z.string().trim().min(1, 'Preferred room is required')
})

export const schemas = {
  resident: residentSchema,
  staff: staffSchema,
  audit: auditSchema,
  compliance: complianceSchema,
  incident: incidentSchema,
  asset: assetSchema,
  medication: medicationSchema,
  rota: rotaSchema,
  training: trainingSchema,
  maintenance: maintenanceSchema,
  risk: riskSchema,
  document: documentSchema,
  enquiry: enquirySchema
}

export type CreateKind = keyof typeof schemas

/** Validated payload for a given create kind, or the union of all of them. */
export type CreateInput<K extends CreateKind = CreateKind> = z.infer<(typeof schemas)[K]>

export function firstSchemaError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Check the form and try again'
}
