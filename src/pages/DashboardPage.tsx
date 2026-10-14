import { useQuery } from '@tanstack/react-query'
import {
  Images,
  ScanText,
  CheckCircle2,
  AlertTriangle,
  Users,
  CameraOff,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { apiClient } from '@/lib/api'
import { API_QUERY_KEYS } from '@/lib/constants'
import { useAppStore } from '@/store/useAppStore'
import { Spinner } from '@/components/ui/Spinner'
import { getStatusColor, formatConfidence } from '@/lib/utils'

export default function DashboardPage() {
  const currentEvent = useAppStore((s) => s.currentEvent)
  const eventId = currentEvent?.id

  const { data: stats, isLoading } = useQuery({
    queryKey: API_QUERY_KEYS.dashboard,
    queryFn: () => apiClient.dashboard.getStats(eventId),
  })

  if (isLoading) return <Spinner size={32} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Live detection overview & event statistics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Photos" value={stats?.total_photos ?? 0} icon={Images} color="text-primary-600" />
        <StatCard label="BIBs Detected" value={stats?.total_bibs_detected ?? 0} icon={ScanText} color="text-primary-600" />
        <StatCard label="Verified" value={stats?.verified_bibs ?? 0} icon={CheckCircle2} color="text-bib-detected" />
        <StatCard label="Unverified" value={stats?.unverified_bibs ?? 0} icon={AlertTriangle} color="text-bib-unverified" sublabel="Needs review" />
        <StatCard label="Unique Runners" value={stats?.unique_runners ?? 0} icon={Users} color="text-primary-600" />
        <StatCard label="No BIB Found" value={stats?.photos_without_bib ?? 0} icon={CameraOff} color="text-bib-rejected" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>OCR Scan Jobs</CardTitle>
          </CardHeader>
          {stats?.scan_jobs && stats.scan_jobs.length > 0 ? (
            <div className="space-y-3">
              {stats.scan_jobs.map((job) => (
                <div key={job.id} className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`bib-badge ${getStatusColor(job.status)}`}>{job.status}</span>
                      <span className="text-sm font-medium uppercase">{job.engine}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {job.processed_photos}/{job.total_photos} photos
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-primary-500 transition-all"
                      style={{ width: `${job.total_photos > 0 ? (job.processed_photos / job.total_photos) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{job.detected_bibs} BIBs detected</span>
                    <span>{formatConfidence(job.processed_photos / Math.max(job.total_photos, 1))}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">No active scan jobs</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detection Distribution</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <DistributionBar label="Verified" value={stats?.verified_bibs ?? 0} total={stats?.total_bibs_detected ?? 0} color="bg-bib-detected" />
            <DistributionBar label="Unverified" value={stats?.unverified_bibs ?? 0} total={stats?.total_bibs_detected ?? 0} color="bg-bib-unverified" />
            <DistributionBar label="No BIB" value={stats?.photos_without_bib ?? 0} total={stats?.total_photos ?? 0} color="bg-bib-rejected" />
          </div>
        </Card>
      </div>
    </div>
  )
}

function DistributionBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
