import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatConfidence(score: number): string {
  return `${(score * 100).toFixed(1)}%`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    verified: 'bg-bib-detected text-white',
    unverified: 'bg-bib-unverified text-white',
    rejected: 'bg-bib-rejected text-white',
    pending: 'bg-gray-400 text-white',
    preprocessing: 'bg-blue-400 text-white',
    ocr_scanning: 'bg-primary-500 text-white',
    postprocessing: 'bg-purple-400 text-white',
    indexed: 'bg-bib-detected text-white',
    failed: 'bg-bib-rejected text-white',
    idle: 'bg-gray-300 text-gray-700',
    scanning: 'bg-primary-500 text-white animate-pulse',
    completed: 'bg-bib-detected text-white',
    error: 'bg-bib-rejected text-white',
  }
  return colors[status] ?? 'bg-gray-300 text-gray-700'
}

export function truncateText(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}
