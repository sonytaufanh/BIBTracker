import { PanelLeftOpen, Menu } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export function Header() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const currentEvent = useAppStore((s) => s.currentEvent)
  const user = useAppStore((s) => s.user)

  return (
    <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
      {!sidebarOpen && (
        <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <PanelLeftOpen size={20} />
        </button>
      )}
      <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 lg:hidden">
        <Menu size={20} />
      </button>

      <div className="flex-1">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {currentEvent?.name ?? 'No event selected'}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        )}
        <div className="h-8 w-8 rounded-full bg-primary-500" />
      </div>
    </header>
  )
}
