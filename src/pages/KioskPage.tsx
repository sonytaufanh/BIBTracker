import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, Activity } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { PhotoGrid } from '@/components/gallery/PhotoGrid'
import { Spinner } from '@/components/ui/Spinner'
import { apiClient } from '@/lib/api'

export default function KioskPage() {
  const [query, setQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['kiosk-search', query],
    queryFn: () => apiClient.search.byBib({ bib_numbers: [query] }),
    enabled: query.length > 0,
  })

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      <header className="flex items-center justify-center gap-3 py-8">
        <Activity className="text-primary-500" size={32} />
        <h1 className="text-3xl font-bold">BIBTracker</h1>
      </header>

      <div className="flex flex-1 flex-col items-center px-4">
        <div className="mb-2 flex items-center gap-2 text-gray-400">
          <SearchIcon size={20} />
          <span className="text-lg">Find your photos by BIB number</span>
        </div>

        <SearchBar
          onSearch={setQuery}
          placeholder="Enter your BIB number..."
          className="max-w-lg text-lg"
        />

        <div className="mt-8 w-full max-w-7xl">
          {query && isLoading ? (
            <div className="flex justify-center py-20"><Spinner size={48} /></div>
          ) : data && data.photos.length > 0 ? (
            <PhotoGrid photos={data.photos} />
          ) : query ? (
            <div className="py-20 text-center text-gray-500">
              <p className="text-xl">No photos found for BIB #{query}</p>
              <p className="mt-2 text-sm">Please check your BIB number and try again</p>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-gray-600">
        BIBTracker Kiosk Mode - Public Search
      </footer>
    </div>
  )
}
