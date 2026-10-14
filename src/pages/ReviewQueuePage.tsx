import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { apiClient } from '@/lib/api'
import { API_QUERY_KEYS, REVIEW_QUEUE_THRESHOLD } from '@/lib/constants'
import { useAppStore } from '@/store/useAppStore'
import { formatConfidence } from '@/lib/utils'

export default function ReviewQueuePage() {
  const currentEvent = useAppStore((s) => s.currentEvent)
  const queryClient = useQueryClient()

  const { data: items, isLoading } = useQuery({
    queryKey: API_QUERY_KEYS.reviewQueue(currentEvent?.id),
    queryFn: () => apiClient.reviewQueue.list(currentEvent?.id),
  })

  const verifyMutation = useMutation({
    mutationFn: ({ id, bib }: { id: string; bib: string }) => apiClient.detections.verify(id, bib),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.reviewQueue() }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.detections.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.reviewQueue() }),
  })

  if (isLoading) return <Spinner size={32} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review Queue</h1>
        <p className="text-sm text-gray-500">
          Detections with confidence &lt; {(REVIEW_QUEUE_THRESHOLD * 100).toFixed(0)}% require manual verification
        </p>
      </div>

      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.photo.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                <img
                  src={item.photo.thumbnail_url}
                  alt={item.photo.filename}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-3 p-4">
                <p className="truncate text-sm font-medium">{item.photo.filename}</p>
                {item.detections.map((d) => (
                  <div key={d.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bib-badge bg-primary-600 text-white">#{d.bib_number}</span>
                      <Badge status={d.status} label={formatConfidence(d.confidence_score)} />
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => verifyMutation.mutate({ id: d.id, bib: d.bib_number })}
                        disabled={verifyMutation.isPending}
                      >
                        <Check size={14} /> Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => rejectMutation.mutate(d.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
                {item.suggested_bib && (
                  <p className="text-xs text-gray-500">Suggested: #{item.suggested_bib}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ImageIcon size={48} className="mb-3" />
          <p className="text-lg font-medium">Review queue is empty</p>
          <p className="mt-1 text-sm">All detections meet the confidence threshold</p>
        </div>
      )}
    </div>
  )
}
