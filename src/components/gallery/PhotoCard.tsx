import { Badge } from '@/components/ui/Badge'
import { formatConfidence, formatDate } from '@/lib/utils'
import type { Photo } from '@/types'

interface PhotoCardProps {
  photo: Photo
  onClick?: (photo: Photo) => void
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const primaryDetection = photo.detections[0]

  return (
    <div
      onClick={() => onClick?.(photo)}
      className="card-base group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={photo.thumbnail_url}
          alt={photo.filename}
          loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {photo.detections.slice(0, 3).map((d) => (
            <span key={d.id} className="bib-badge bg-primary-600 text-white">
              #{d.bib_number}
            </span>
          ))}
          {photo.detections.length > 3 && (
            <span className="bib-badge bg-gray-600 text-white">+{photo.detections.length - 3}</span>
          )}
        </div>
        {primaryDetection && (
          <div className="absolute bottom-2 right-2">
            <Badge status={primaryDetection.status} label={formatConfidence(primaryDetection.confidence_score)} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{photo.filename}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {photo.detected_at ? formatDate(photo.detected_at) : 'No timestamp'}
        </p>
      </div>
    </div>
  )
}
