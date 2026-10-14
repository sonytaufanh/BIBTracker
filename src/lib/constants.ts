import type { OCREngine, StorageAdapter, UserRole } from '@/types'

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'Gallery', path: '/gallery', icon: 'Images' },
  { label: 'Search', path: '/search', icon: 'Search' },
  { label: 'Review Queue', path: '/review', icon: 'ClipboardCheck' },
  { label: 'Participants', path: '/participants', icon: 'Users' },
  { label: 'Runner Timeline', path: '/timeline', icon: 'Clock' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
] as const

export const OCR_ENGINE_OPTIONS: { value: OCREngine; label: string; description: string; isFree: boolean }[] = [
  {
    value: 'local',
    label: 'Local Engine (EasyOCR/Tesseract)',
    description: '100% Free - Runs on local server. Good for clear photos.',
    isFree: true,
  },
  {
    value: 'gemini',
    label: 'Gemini Vision API',
    description: 'Premium - High accuracy for tilted, shadowed, or folded photos.',
    isFree: false,
  },
  {
    value: 'cloudvision',
    label: 'Google Cloud Vision',
    description: 'Premium - Enterprise-grade OCR with high throughput.',
    isFree: false,
  },
]

export const STORAGE_ADAPTER_OPTIONS: { value: StorageAdapter; label: string }[] = [
  { value: 'local', label: 'Local Disk' },
  { value: 'gdrive', label: 'Google Drive' },
  { value: 's3', label: 'Amazon S3' },
  { value: 'r2', label: 'Cloudflare R2' },
]

export const CONFIDENCE_THRESHOLD = 0.7

export const REVIEW_QUEUE_THRESHOLD = 0.6

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  operator: 'Race Operator',
  viewer: 'Viewer',
}

export const PAGE_SIZES = [24, 48, 96, 192]

export const API_QUERY_KEYS = {
  dashboard: ['dashboard'] as const,
  photos: (eventId?: string) => ['photos', eventId] as const,
  search: (filters: unknown) => ['search', filters] as const,
  reviewQueue: (eventId?: string) => ['reviewQueue', eventId] as const,
  participants: (eventId?: string) => ['participants', eventId] as const,
  events: ['events'] as const,
  ocrJobs: (eventId?: string) => ['ocrJobs', eventId] as const,
}
