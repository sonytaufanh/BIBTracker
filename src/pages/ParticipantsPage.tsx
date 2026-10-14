import { useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Users as UsersIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { apiClient } from '@/lib/api'
import { API_QUERY_KEYS } from '@/lib/constants'
import { useAppStore } from '@/store/useAppStore'

export default function ParticipantsPage() {
  const currentEvent = useAppStore((s) => s.currentEvent)
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: API_QUERY_KEYS.participants(currentEvent?.id),
    queryFn: () => apiClient.participants.list(currentEvent?.id),
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => apiClient.participants.import(file, currentEvent!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.participants() })
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && currentEvent) importMutation.mutate(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Participants</h1>
          <p className="text-sm text-gray-500">{data?.total ?? 0} registered runners</p>
        </div>
        <Button onClick={() => fileRef.current?.click()} disabled={!currentEvent || importMutation.isPending}>
          <Upload size={16} /> Import CSV/Excel
        </Button>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
      </div>

      {isLoading ? (
        <Spinner size={32} />
      ) : data && data.data.length > 0 ? (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium">BIB</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Gender</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Team</th>
                <th className="px-4 py-3 text-right font-medium">Photos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.data.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3"><span className="bib-badge bg-primary-600 text-white">#{p.bib_number}</span></td>
                  <td className="px-4 py-3 font-medium">{p.full_name}</td>
                  <td className="px-4 py-3">{p.gender ?? '-'}</td>
                  <td className="px-4 py-3">{p.category ?? '-'}</td>
                  <td className="px-4 py-3">{p.team ?? '-'}</td>
                  <td className="px-4 py-3 text-right">{p.photo_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <UsersIcon size={48} className="mb-3" />
          <p className="text-lg font-medium">No participants imported</p>
          <p className="mt-1 text-sm">Import a CSV/Excel file to match runners with photos</p>
        </div>
      )}
    </div>
  )
}
