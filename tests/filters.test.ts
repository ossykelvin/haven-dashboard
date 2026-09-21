import { describe, expect, it } from 'vitest'
import { filterRecords, matchesQuery, matchesSelected } from '../src/lib/filters'

describe('register filters', () => {
  const records = [
    { id: 'RES-1', name: 'Mary Jones', room: '14B', status: 'Active' },
    { id: 'RES-2', name: 'Arthur Davies', room: '8', status: 'Hospital' }
  ]

  it('matches any searchable field case-insensitively', () => {
    expect(matchesQuery('14b', ['Mary Jones', '14B', 'RES-1'])).toBe(true)
    expect(matchesQuery('  MARY  ', ['Mary Jones'])).toBe(true)
    expect(matchesQuery('zzz', ['Mary Jones'])).toBe(false)
    expect(matchesQuery('', ['Mary Jones'])).toBe(true)
  })

  it('treats the all-option as a pass-through', () => {
    expect(matchesSelected('All statuses', 'All statuses', 'Hospital')).toBe(true)
    expect(matchesSelected('Active', 'All statuses', 'Active')).toBe(true)
    expect(matchesSelected('Active', 'All statuses', 'Hospital')).toBe(false)
  })

  it('combines search text with extra predicates', () => {
    expect(
      filterRecords(
        records,
        'mary',
        item => [item.name, item.room, item.id],
        [item => matchesSelected('Active', 'All statuses', item.status)]
      )
    ).toEqual([records[0]])

    expect(
      filterRecords(
        records,
        'res',
        item => [item.name, item.room, item.id],
        [item => matchesSelected('All statuses', 'All statuses', item.status)]
      )
    ).toHaveLength(2)
  })
})
