import { cn } from '@/lib/utils'
import type { DetectionStatus } from '@/types'

interface BadgeProps {
  status: DetectionStatus | string
  label?: string
  className?: string
}

export function Badge({ status, label, className }: BadgeProps) {
  const statusLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1)
  const colorMap: Record<string, string> = {
    verified: 'bg-bib-detected text-white',
    unverified: 'bg-bib-unverified text-white',
    rejected: 'bg-bib-rejected text-white',
  }

  return (
    <span className={cn('bib-badge', colorMap[status] ?? 'bg-gray-400 text-white', className)}>
      {statusLabel}
    </span>
  )
}
