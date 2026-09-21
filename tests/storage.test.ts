import { describe, expect, it } from 'vitest'
import { isStoredData, mergeStoredData } from '../src/lib/storage'

const validShape = {
  complianceChecks: [],
  residents: [],
  staff: [],
  audits: [],
  incidents: [],
  assets: [],
  notifications: []
}

describe('stored snapshot shape', () => {
  it('accepts the expected top-level collections', () => {
    expect(isStoredData(validShape)).toBe(true)
  })

  it('rejects missing or non-array collections', () => {
    expect(isStoredData(null)).toBe(false)
    expect(isStoredData({ ...validShape, residents: 'nope' })).toBe(false)
    expect(isStoredData({ ...validShape, notifications: undefined })).toBe(false)
  })

  it('fills new module collections when an older snapshot is loaded', () => {
    const merged = mergeStoredData(validShape)
    expect(Array.isArray(merged.medications)).toBe(true)
    expect(Array.isArray(merged.enquiries)).toBe(true)
    expect(merged.residents).toEqual([])
  })
})
