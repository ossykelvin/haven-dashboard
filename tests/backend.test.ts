import { describe, expect, it } from 'vitest'
import { canAccessCampus, hasMenuAccess, ROLE_MENUS } from '@/lib/menus'
import { passwordPolicyError } from '@/lib/password-policy'
import { parseCsv } from '@/lib/csv'
import { formatDate, formatDateTime } from '@/lib/utils'

describe('authorization helpers', () => {
  it('grants every menu to admin', () => {
    expect(ROLE_MENUS.admin).toContain('medication')
    expect(ROLE_MENUS.admin).toContain('change-audit')
  })

  it('keeps clerks off clinical medication', () => {
    expect(ROLE_MENUS.clerk).not.toContain('medication')
    expect(hasMenuAccess(ROLE_MENUS.clerk, 'assets')).toBe(true)
  })

  it('scopes campus access', () => {
    const home = 'campus-a'
    expect(canAccessCampus(['staff'], home, [], false, home)).toBe(true)
    expect(canAccessCampus(['staff'], home, [], false, 'campus-b')).toBe(false)
    expect(canAccessCampus(['admin'], home, [], false, 'campus-b')).toBe(true)
    expect(canAccessCampus(['manager'], home, [], false, 'campus-b')).toBe(true)
  })
})

describe('password policy', () => {
  it('accepts the demonstration password', () => {
    expect(passwordPolicyError('HavenDemo!2026')).toBeNull()
  })

  it('rejects a short password', () => {
    expect(passwordPolicyError('Short1!')).toMatch(/12 characters/)
  })
})

describe('display dates', () => {
  it('formats ISO dates and leaves empty values as a dash', () => {
    expect(formatDate('2026-09-22')).toMatch(/22 Sep/)
    expect(formatDate('')).toBe('—')
    expect(formatDateTime('')).toBe('—')
  })
})

describe('csv import parser', () => {
  it('maps CompliCare aliases onto Haven fields', () => {
    const rows = parseCsv('full_name,room_number\n"Margaret Wilson",12A')
    expect(rows[0]).toEqual({ name: 'Margaret Wilson', room: '12A' })
  })
})
