import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
