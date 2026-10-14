import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Images,
  Search,
  ClipboardCheck,
  Users,
  Clock,
  Settings,
  Activity,
  PanelLeftClose,
} from 'lucide-react'
import { NAV_ITEMS } from '@/lib/constants'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

const iconMap = {
  LayoutDashboard,
  Images,
  Search,
  ClipboardCheck,
  Users,
  Clock,
  Settings,
}

export function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const currentEvent = useAppStore((s) => s.currentEvent)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-transform dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0',
        sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full',
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-800">
        <Activity className="text-primary-600" size={24} />
        <span className="text-lg font-bold">BIBTracker</span>
        <button onClick={toggleSidebar} className="ml-auto lg:hidden">
          <PanelLeftClose size={20} />
        </button>
      </div>

      {currentEvent && (
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <p className="text-xs text-gray-500">Active Event</p>
          <p className="truncate text-sm font-semibold">{currentEvent.name}</p>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap]
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                )
              }
            >
              {Icon && <Icon size={18} />}
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <NavLink
          to="/kiosk"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Search size={18} />
          Kiosk Mode
        </NavLink>
      </div>
    </aside>
  )
}
