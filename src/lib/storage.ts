import { initialData } from '@/lib/mock-data'
import type { HavenData } from '@/lib/types'

export const STORAGE_KEY = 'haven-care-data-v1'

const requiredKeys = [
  'complianceChecks',
  'residents',
  'staff',
  'audits',
  'incidents',
  'assets',
  'notifications'
] as const satisfies ReadonlyArray<keyof HavenData>

export function isStoredData(value: unknown): value is Partial<HavenData> {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<HavenData>
  return requiredKeys.every(key => Array.isArray(data[key]))
}

export function mergeStoredData(value: Partial<HavenData>): HavenData {
  return {
    ...initialData,
    ...value,
    medications: Array.isArray(value.medications) ? value.medications : initialData.medications,
    rotaShifts: Array.isArray(value.rotaShifts) ? value.rotaShifts : initialData.rotaShifts,
    trainings: Array.isArray(value.trainings) ? value.trainings : initialData.trainings,
    maintenanceTasks: Array.isArray(value.maintenanceTasks) ? value.maintenanceTasks : initialData.maintenanceTasks,
    risks: Array.isArray(value.risks) ? value.risks : initialData.risks,
    documents: Array.isArray(value.documents) ? value.documents : initialData.documents,
    enquiries: Array.isArray(value.enquiries) ? value.enquiries : initialData.enquiries
  }
}

export function loadStoredData(): HavenData | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    return isStoredData(parsed) ? mergeStoredData(parsed) : null
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveStoredData(data: HavenData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
