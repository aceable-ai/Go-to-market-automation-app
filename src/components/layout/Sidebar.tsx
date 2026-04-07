'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Rocket,
  LayoutDashboard,
  FileText,
  BarChart3,
  ListChecks,
  PlusCircle,
  Megaphone,
  ChevronLeft,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  {
    section: 'PMM GTM Tracker',
    icon: Rocket,
    items: [
      { name: 'Overview',             href: '/',             icon: LayoutDashboard },
      { name: 'PMM One-Pager Review', href: '/one-pagers',   icon: FileText },
      { name: 'Task Dashboard',       href: '/tasks',        icon: BarChart3 },
      { name: 'GTM Task Tracking',    href: '/tasks/all',    icon: ListChecks },
      { name: 'New Launch',           href: '/launches/new', icon: PlusCircle },
      { name: 'Landing Pages',        href: '/landing-pages', icon: Globe },
    ],
  },
  {
    section: 'Asset Pick Up Window',
    icon: Megaphone,
    items: [
      { name: 'Assets', href: '/assets', icon: Megaphone },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] min-h-screen bg-sidebar flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center shrink-0">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm leading-tight">
            Product Launch<br />Hub
          </span>
        </div>
      </div>

      <div className="h-px bg-white/10 mx-3" />

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-5 overflow-y-auto mt-2">
        {nav.map(({ section, icon: Icon, items }) => (
          <div key={section}>
            <div className="flex items-center gap-2 px-2 py-1 mb-1">
              <Icon className="w-3.5 h-3.5 text-white/50" />
              <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                {section}
              </span>
            </div>
            <div className="space-y-0.5">
              {items.map(({ name, href, icon: ItemIcon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                    pathname === href
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                  {name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse */}
      <div className="p-3 border-t border-white/10">
        <button className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
          Collapse
        </button>
      </div>
    </aside>
  )
}
