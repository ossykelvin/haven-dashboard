'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Building2, ChevronLeft, ChevronRight, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useHavenData } from '@/components/data-provider'
import { DashboardPage } from '@/components/pages/dashboard-page'
import { NAV_ITEMS_BY_PATH, NAV_SECTIONS, canOpenMenu, type NavItem } from '@/components/navigation'
import { cn, initials } from '@/lib/utils'
import { unreadNotificationCount } from '@/lib/metrics'

function Navigation({
  items,
  collapsed,
  pathname,
  onNavigate
}: {
  items: NavItem[]
  collapsed: boolean
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-1">
      {items.map(item => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.name : undefined}
            className={cn(
              'group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
              active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
              collapsed && 'justify-center px-0'
            )}
          >
            {active ? <span className="absolute -left-3 h-5 w-1 rounded-r-full bg-blue-600" /> : null}
            <Icon className={cn('size-[18px] shrink-0', active ? 'text-blue-600' : 'text-slate-400')} />
            {!collapsed ? <span>{item.name}</span> : null}
          </Link>
        )
      })}
    </nav>
  )
}

function Sidebar({
  collapsed,
  pathname,
  onCollapse,
  mobile,
  onClose
}: {
  collapsed: boolean
  pathname: string
  onCollapse: () => void
  mobile?: boolean
  onClose?: () => void
}) {
  const { session } = useHavenData()
  const router = useRouter()
  const menus = session?.menus ?? []
  const visibleSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => canOpenMenu(menus, item.menuKey))
  })).filter(section => section.items.length)

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200',
        collapsed ? 'w-[76px]' : 'w-[256px]'
      )}
    >
      <div className={cn('flex h-20 items-center border-b border-slate-100 px-5', collapsed && 'justify-center px-0')}>
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={onClose}>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Building2 className="size-5" />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block text-lg font-bold tracking-tight text-slate-950">Haven</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Care compliance
              </span>
            </span>
          ) : null}
        </Link>
        {mobile ? (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={onClose} aria-label="Close navigation">
            <X />
          </Button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {visibleSections.map((section, index) => (
          <div key={section.label}>
            {index ? <div className="my-5 border-t border-slate-100" /> : null}
            {!collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {section.label}
              </p>
            ) : null}
            <Navigation items={section.items} collapsed={collapsed} pathname={pathname} onNavigate={onClose} />
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-3">
        {!collapsed ? (
          <div className="mb-3 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {initials(session?.name || 'H')}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-800">{session?.name || 'Haven user'}</span>
                <span className="block truncate text-xs text-slate-500">{session?.roles.join(', ') || 'Signed in'}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-3 grid place-items-center">
            <span className="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {initials(session?.name || 'H')}
            </span>
          </div>
        )}
        <Button variant="ghost" className={cn('mb-1 w-full', !collapsed && 'justify-start')} onClick={signOut}>
          <LogOut />
          {!collapsed ? 'Sign out' : <span className="sr-only">Sign out</span>}
        </Button>
        {!mobile ? (
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className={cn('w-full', !collapsed && 'justify-start')}
            onClick={onCollapse}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
            {!collapsed ? 'Collapse sidebar' : <span className="sr-only">Expand sidebar</span>}
          </Button>
        ) : null}
      </div>
    </aside>
  )
}

function CurrentPage({ pathname }: { pathname: string }) {
  const { session } = useHavenData()
  const item = NAV_ITEMS_BY_PATH[pathname]
  if (!item) return <DashboardPage />
  if (session && !canOpenMenu(session.menus, item.menuKey)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
        You do not have access to this module.
      </div>
    )
  }
  const Page = item.Page
  return <Page />
}

export function HavenApp() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const data = useHavenData()
  const unread = unreadNotificationCount(data)
  const meta = NAV_ITEMS_BY_PATH[pathname] ?? NAV_ITEMS_BY_PATH['/']

  if (data.loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading Haven…</div>
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar collapsed={collapsed} pathname={pathname} onCollapse={() => setCollapsed(value => !value)} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/30"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-[280px]">
            <Sidebar
              collapsed={false}
              pathname={pathname}
              onCollapse={() => undefined}
              mobile
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div
        className={cn('min-h-screen transition-[margin] duration-200', collapsed ? 'lg:ml-[76px]' : 'lg:ml-[256px]')}
      >
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600">{meta.eyebrow}</p>
            <p className="mt-0.5 font-semibold text-slate-900">{meta.name}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-400">
                {new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
              </p>
              <p className="text-sm font-semibold text-slate-700">{data.session?.campusName || 'Haven'}</p>
            </div>
            <Link
              href="/notifications"
              className="relative grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
              aria-label={`${unread} unread notifications`}
            >
              <Bell className="size-[18px]" />
              {unread ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-5 text-white ring-2 ring-white">
                  {unread}
                </span>
              ) : null}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
          <CurrentPage pathname={pathname} />
        </main>
      </div>
    </div>
  )
}
