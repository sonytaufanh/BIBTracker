import { PhotoCard } from './PhotoCard'
import type { Photo } from '@/types'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick?: (photo: Photo) => void
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-lg font-medium">No photos found</p>
        <p className="mt-1 text-sm">Photos will appear here after ingestion and OCR scan.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} onClick={onPhotoClick} />
      ))}
    </div>
  )
}
