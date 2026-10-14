import axios from 'axios'
import type {
  Photo,
  Participant,
  RaceEvent,
  DashboardStats,
  SearchResult,
  SearchFilters,
  ReviewQueueItem,
  OCRScanJob,
  PaginatedResponse,
  AppUser,
} from '@/types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bibtracker_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bibtracker_token')
    }
    return Promise.reject(error)
  },
)

export const apiClient = {
  events: {
    list: () => api.get<PaginatedResponse<RaceEvent>>('/events').then((r) => r.data),
    get: (id: string) => api.get<RaceEvent>(`/events/${id}`).then((r) => r.data),
    create: (data: Partial<RaceEvent>) => api.post<RaceEvent>('/events', data).then((r) => r.data),
    update: (id: string, data: Partial<RaceEvent>) =>
      api.put<RaceEvent>(`/events/${id}`, data).then((r) => r.data),
    delete: (id: string) => api.delete(`/events/${id}`).then((r) => r.data),
  },

  photos: {
    list: (params?: { event_id?: string; page?: number; per_page?: number }) =>
      api.get<PaginatedResponse<Photo>>('/photos', { params }).then((r) => r.data),
    get: (id: string) => api.get<Photo>(`/photos/${id}`).then((r) => r.data),
    delete: (id: string) => api.delete(`/photos/${id}`).then((r) => r.data),
    bulkDelete: (ids: string[]) => api.delete('/photos/bulk', { data: { ids } }).then((r) => r.data),
    download: (id: string) => api.get(`/photos/${id}/download`, { responseType: 'blob' }).then((r) => r.data),
    bulkDownload: (ids: string[]) =>
      api.post('/photos/bulk-download', { ids }, { responseType: 'blob' }).then((r) => r.data),
  },

  search: {
    byBib: (filters: SearchFilters, page = 1, perPage = 24) =>
      api
        .post<SearchResult>('/search', { ...filters, page, per_page: perPage })
        .then((r) => r.data),
  },

  detections: {
    verify: (id: string, bibNumber: string) =>
      api.patch(`/detections/${id}/verify`, { bib_number: bibNumber }).then((r) => r.data),
    reject: (id: string) => api.patch(`/detections/${id}/reject`).then((r) => r.data),
    updateBib: (id: string, bibNumber: string) =>
      api.patch(`/detections/${id}`, { bib_number: bibNumber }).then((r) => r.data),
  },

  reviewQueue: {
    list: (eventId?: string) =>
      api
        .get<ReviewQueueItem[]>('/review-queue', { params: { event_id: eventId } })
        .then((r) => r.data),
  },

  participants: {
    list: (eventId?: string) =>
      api
        .get<PaginatedResponse<Participant>>('/participants', { params: { event_id: eventId } })
        .then((r) => r.data),
    import: (file: File, eventId: string) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('event_id', eventId)
      return api
        .post('/participants/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data)
    },
    getByBib: (bibNumber: string, eventId: string) =>
      api
        .get<Participant>(`/participants/bib/${bibNumber}`, { params: { event_id: eventId } })
        .then((r) => r.data),
  },

  ocr: {
    triggerScan: (eventId: string, engine: string) =>
      api.post<OCRScanJob>('/ocr/scan', { event_id: eventId, engine }).then((r) => r.data),
    getJobStatus: (jobId: string) =>
      api.get<OCRScanJob>(`/ocr/jobs/${jobId}`).then((r) => r.data),
    getActiveJobs: (eventId?: string) =>
      api.get<OCRScanJob[]>('/ocr/jobs', { params: { event_id: eventId, active: true } }).then((r) => r.data),
  },

  dashboard: {
    getStats: (eventId?: string) =>
      api.get<DashboardStats>('/dashboard/stats', { params: { event_id: eventId } }).then((r) => r.data),
  },

  ingestion: {
    sync: (eventId: string, adapter: string) =>
      api.post('/ingestion/sync', { event_id: eventId, adapter }).then((r) => r.data),
    getStatus: (eventId: string) =>
      api.get(`/ingestion/status/${eventId}`).then((r) => r.data),
  },

  share: {
    createLink: (bibNumber: string, eventId: string) =>
      api.post('/share', { bib_number: bibNumber, event_id: eventId }).then((r) => r.data),
    getSharedPhotos: (token: string) =>
      api.get<Photo[]>(`/share/${token}`).then((r) => r.data),
  },

  auth: {
    login: (email: string, password: string) =>
      api.post<{ token: string; user: AppUser }>('/auth/login', { email, password }).then((r) => r.data),
    me: () => api.get<AppUser>('/auth/me').then((r) => r.data),
  },
}
