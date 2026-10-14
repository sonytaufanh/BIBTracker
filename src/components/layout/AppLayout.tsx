import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className={cn('flex flex-1 flex-col overflow-hidden', sidebarOpen ? 'lg:ml-0' : '')}>
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
