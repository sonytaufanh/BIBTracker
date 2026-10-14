import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import GalleryPage from '@/pages/GalleryPage'
import SearchPage from '@/pages/SearchPage'
import ReviewQueuePage from '@/pages/ReviewQueuePage'
import ParticipantsPage from '@/pages/ParticipantsPage'
import RunnerTimelinePage from '@/pages/RunnerTimelinePage'
import SettingsPage from '@/pages/SettingsPage'
import KioskPage from '@/pages/KioskPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/review" element={<ReviewQueuePage />} />
        <Route path="/participants" element={<ParticipantsPage />} />
        <Route path="/timeline" element={<RunnerTimelinePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/kiosk" element={<KioskPage />} />
    </Routes>
  )
}
