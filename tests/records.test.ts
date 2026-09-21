import { describe, expect, it } from 'vitest'
import {
  calculatedRiskLevel,
  createIncident,
  createResident,
  createRisk,
  createStaff,
  incidentReference,
  staffCompletion
} from '../src/lib/records'

describe('record factories', () => {
  it('fills resident care-plan defaults', () => {
    const resident = createResident({
      name: 'Mary Jones',
      room: '14B',
      dateOfBirth: '1939-04-17',
      risk: 'Low',
      nextReview: '2026-10-10',
      status: 'Active'
    })

    expect(resident.id).toMatch(/^RES-/)
    expect(resident.carePlan).toBe('Up to date')
    expect(resident.medication).toBe('Reviewed')
  })

  it('maps staff completion from compliance status', () => {
    expect(staffCompletion('Compliant')).toBe(100)
    expect(staffCompletion('Due soon')).toBe(80)
    expect(staffCompletion('Action required')).toBe(55)
    expect(
      createStaff({
        name: 'Hannah Green',
        role: 'Care Assistant',
        employment: 'Permanent',
        dbsExpiry: '2027-01-01',
        nextTraining: '2026-10-01',
        supervisionDate: '2026-10-15',
        status: 'Due soon'
      }).completion
    ).toBe(80)
  })

  it('builds a sequential incident reference from the record date', () => {
    expect(incidentReference('2026-09-18', 3)).toBe('INC-2026-122')
    expect(
      createIncident(
        {
          type: 'Fall',
          severity: 'Medium',
          status: 'Open',
          location: 'Lounge',
          date: '2026-09-18',
          time: '13:15',
          resident: 'Mary Jones',
          reporter: 'Hannah Green',
          summary: 'Resident lowered to the floor with no injury observed.'
        },
        0
      ).reference
    ).toBe('INC-2026-119')
  })

  it('scores operational risk from likelihood and impact', () => {
    expect(calculatedRiskLevel('Low', 'Low')).toBe('Low')
    expect(calculatedRiskLevel('Medium', 'High')).toBe('High')
    expect(calculatedRiskLevel('High', 'High')).toBe('Critical')
    expect(
      createRisk({
        title: 'Night cover',
        category: 'Workforce',
        likelihood: 'High',
        impact: 'Medium',
        owner: 'Olivia Bennett',
        nextReview: '2026-10-01',
        status: 'Open'
      }).level
    ).toBe('High')
  })
})
