import { useQuery } from '@tanstack/react-query'
import { PhotoGrid } from '@/components/gallery/PhotoGrid'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { apiClient } from '@/lib/api'
import { API_QUERY_KEYS } from '@/lib/constants'
import { useAppStore } from '@/store/useAppStore'

export default function GalleryPage() {
  const currentEvent = useAppStore((s) => s.currentEvent)
  const eventId = currentEvent?.id

  const { data, isLoading } = useQuery({
    queryKey: API_QUERY_KEYS.photos(eventId),
    queryFn: () => apiClient.photos.list({ event_id: eventId, page: 1, per_page: 48 }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photo Gallery</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} photos indexed</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Filter</Button>
          <Button variant="outline" size="sm">Sort by Date</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : (
        <PhotoGrid photos={data?.data ?? []} />
      )}
    </div>
  )
}
