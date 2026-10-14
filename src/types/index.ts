export type OCREngine = 'local' | 'gemini' | 'cloudvision'
export type OCREngineStatus = 'idle' | 'scanning' | 'completed' | 'error'

export type StorageAdapter = 'local' | 'gdrive' | 's3' | 'r2'

export type DetectionStatus = 'verified' | 'unverified' | 'rejected'

export type PhotoProcessingStatus =
  | 'pending'
  | 'preprocessing'
  | 'ocr_scanning'
  | 'postprocessing'
  | 'indexed'
  | 'failed'

export type UserRole = 'admin' | 'operator' | 'viewer'

export type EventStatus = 'upcoming' | 'active' | 'completed' | 'archived'

export interface BIBDetection {
  id: string
  photo_id: string
  bib_number: string
  confidence_score: number
  status: DetectionStatus
  bounding_box?: BoundingBox
  detected_at: string
  verified_at?: string | null
  verified_by?: string | null
  participant_id?: string | null
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Photo {
  id: string
  filename: string
  source_path: string
  thumbnail_url: string
  full_url: string
  storage_adapter: StorageAdapter
  file_size: number
  width: number
  height: number
  exif_timestamp?: string | null
  detected_at?: string | null
  processing_status: PhotoProcessingStatus
  detections: BIBDetection[]
  event_id: string
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  bib_number: string
  full_name: string
  email?: string | null
  phone?: string | null
  gender?: 'M' | 'F' | null
  category?: string | null
  team?: string | null
  event_id: string
  photo_count: number
  created_at: string
  updated_at: string
}

export interface RaceEvent {
  id: string
  name: string
  slug: string
  event_date: string
  status: EventStatus
  location: string
  logo_url?: string | null
  watermark_logo_url?: string | null
  total_participants: number
  total_photos: number
  total_bibs_detected: number
  created_at: string
  updated_at: string
}

export interface OCRScanJob {
  id: string
  event_id: string
  engine: OCREngine
  status: OCREngineStatus
  total_photos: number
  processed_photos: number
  detected_bibs: number
  started_at: string
  completed_at?: string | null
  error_message?: string | null
}

export interface DashboardStats {
  total_photos: number
  total_bibs_detected: number
  verified_bibs: number
  unverified_bibs: number
  unique_runners: number
  photos_without_bib: number
  ocr_progress: number
  scan_jobs: OCRScanJob[]
}

export interface SearchFilters {
  bib_numbers: string[]
  event_id?: string
  date_from?: string
  date_to?: string
  min_confidence?: number
  status?: DetectionStatus
  storage_adapter?: StorageAdapter
}

export interface SearchResult {
  photos: Photo[]
  total: number
  page: number
  per_page: number
}

export interface ReviewQueueItem {
  photo: Photo
  detections: BIBDetection[]
  suggested_bib?: string | null
}

export interface AppUser {
  id: string
  email: string
  name: string
  role: UserRole
  event_ids: string[]
}

export interface ShareableLink {
  token: string
  bib_number: string
  event_id: string
  expires_at?: string | null
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
