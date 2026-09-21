'use client'

import { MENU_DEFINITIONS, APP_ROLES } from '@/lib/menus'
import { useHavenData } from '@/components/data-provider'
import { PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function RolesPage() {
  const { roleMenus, session, refresh } = useHavenData()
  const isAdmin = session?.roles.includes('admin')

  const toggle = async (role: string, menuKey: string, enabled: boolean) => {
    await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, menuKey, enabled })
    })
    await refresh()
  }

  return (
    <>
      <PageHeader title="Roles" description="Menu grants are stored in tbl_role_menu and checked on every API request." />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu</TableHead>
              {APP_ROLES.map(role => (
                <TableHead key={role}>{role}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {MENU_DEFINITIONS.map(menu => (
              <TableRow key={menu.menuKey}>
                <TableCell>{menu.label}</TableCell>
                {APP_ROLES.map(role => {
                  const enabled = roleMenus.some(grant => grant.role === role && grant.menuKey === menu.menuKey)
                  return (
                    <TableCell key={role}>
                      <Button
                        type="button"
                        size="sm"
                        variant={enabled ? 'default' : 'outline'}
                        disabled={!isAdmin}
                        onClick={() => toggle(role, menu.menuKey, !enabled)}
                      >
                        {enabled ? 'On' : 'Off'}
                      </Button>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
