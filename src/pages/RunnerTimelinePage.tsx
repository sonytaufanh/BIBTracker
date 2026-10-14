import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Clock, MapPin } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { apiClient } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Photo } from '@/types'

export default function RunnerTimelinePage() {
  const [bibNumber, setBibNumber] = useState('')

  const { data: photos, isLoading } = useQuery({
    queryKey: ['timeline', bibNumber],
    queryFn: () =>
      apiClient.search.byBib({ bib_numbers: [bibNumber] }).then((r) => r.photos),
    enabled: bibNumber.length > 0,
  })

  const sortedPhotos = photos
    ? [...photos].sort((a, b) => {
        const aTime = a.detected_at ? new Date(a.detected_at).getTime() : 0
        const bTime = b.detected_at ? new Date(b.detected_at).getTime() : 0
        return aTime - bTime
      })
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Runner Timeline</h1>
        <p className="text-sm text-gray-500">Chronological photo timeline for a specific runner</p>
      </div>

      <Card>
        <SearchBar onSearch={setBibNumber} placeholder="Enter BIB number to view timeline..." className="max-w-xl" />
      </Card>

      {bibNumber && (
        <>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary-600" />
            <h2 className="text-lg font-semibold">BIB #{bibNumber}</h2>
            {photos && <span className="text-sm text-gray-500">{photos.length} photos</span>}
          </div>

          {isLoading ? (
            <Spinner size={32} />
          ) : sortedPhotos.length > 0 ? (
            <div className="relative space-y-4 before:absolute before:left-4 before:top-0 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
              {sortedPhotos.map((photo, idx) => (
                <TimelineItem key={photo.id} photo={photo} index={idx} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-gray-400">No photos found for BIB #{bibNumber}</p>
          )}
        </>
      )}
    </div>
  )
}

function TimelineItem({ photo, index }: { photo: Photo; index: number }) {
  return (
    <div className="relative flex gap-4 pl-12">
      <div className="absolute left-2.5 top-3 h-3 w-3 rounded-full border-2 border-primary-500 bg-white dark:bg-gray-900" />
      <Card className="flex-1">
        <div className="flex gap-4">
          <img
            src={photo.thumbnail_url}
            alt={photo.filename}
            loading="lazy"
            className="h-24 w-32 rounded-md object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary-600">Checkpoint {index + 1}</span>
            </div>
            <p className="mt-1 text-sm font-medium">{photo.filename}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              {photo.detected_at ? formatDate(photo.detected_at) : 'No timestamp'}
            </div>
            {photo.detections.length > 0 && (
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} />
                {photo.detections.length} BIB{photo.detections.length > 1 ? 's' : ''} detected
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
