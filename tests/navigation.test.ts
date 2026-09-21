import { describe, expect, it } from 'vitest'
import { MENU_DEFINITIONS, ROLE_MENUS } from '../src/lib/menus'
import { NAV_ITEMS_BY_PATH, NAV_SECTIONS, UNGATED_MENUS, canOpenMenu } from '../src/components/navigation'

const navMenuKeys = NAV_SECTIONS.flatMap(section => section.items).map(item => item.menuKey)

describe('navigation registry', () => {
  it('routes every navigation item to a defined menu key', () => {
    const defined = new Set(MENU_DEFINITIONS.map(item => item.menuKey))
    for (const key of navMenuKeys) expect(defined.has(key)).toBe(true)
  })

  it('indexes every item by its href', () => {
    expect(Object.keys(NAV_ITEMS_BY_PATH)).toHaveLength(navMenuKeys.length)
    expect(NAV_ITEMS_BY_PATH['/'].menuKey).toBe('dashboard')
  })

  it('gates a menu the role was not granted', () => {
    expect(canOpenMenu(ROLE_MENUS.admissions, 'medication')).toBe(false)
  })

  it('opens a menu the role was granted', () => {
    expect(canOpenMenu(ROLE_MENUS.admissions, 'enquiries')).toBe(true)
  })

  it('keeps the ungated menus open to every signed-in user', () => {
    for (const key of UNGATED_MENUS) expect(canOpenMenu([], key)).toBe(true)
  })
})
