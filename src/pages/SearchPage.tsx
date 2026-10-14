import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SearchBar } from '@/components/search/SearchBar'
import { PhotoGrid } from '@/components/gallery/PhotoGrid'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { apiClient } from '@/lib/api'
import { API_QUERY_KEYS } from '@/lib/constants'
import { useAppStore } from '@/store/useAppStore'
import type { SearchFilters } from '@/types'

export default function SearchPage() {
  const currentEvent = useAppStore((s) => s.currentEvent)
  const [query, setQuery] = useState('')

  const filters: SearchFilters = {
    bib_numbers: query ? query.split(',').map((s) => s.trim()).filter(Boolean) : [],
    event_id: currentEvent?.id,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: API_QUERY_KEYS.search(filters),
    queryFn: () => apiClient.search.byBib(filters),
    enabled: query.length > 0,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">BIB Search</h1>
        <p className="text-sm text-gray-500">Enter one or more BIB numbers (comma-separated)</p>
      </div>

      <Card>
        <SearchBar
          onSearch={setQuery}
          placeholder="e.g. 123, 456, 789"
          className="max-w-xl"
        />
      </Card>

      {query && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Results</h2>
            {(isLoading || isFetching) && <Spinner size={16} />}
            {data && <span className="text-sm text-gray-500">{data.total} photos found</span>}
          </div>
          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner size={32} /></div>
          ) : (
            <PhotoGrid photos={data?.photos ?? []} />
          )}
        </div>
      )}

      {!query && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg font-medium">Search for photos by BIB number</p>
          <p className="mt-1 text-sm">Enter a BIB number above to find all matching photos</p>
        </div>
      )}
    </div>
  )
}
