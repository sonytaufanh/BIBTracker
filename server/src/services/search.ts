import { prisma } from '../config/prisma.js'
import type { Photo } from '@prisma/client'

export interface SearchResult {
  photos: (Photo & { detections: Array<{ id: string; bibNumber: string; confidenceScore: number; status: string }> })[]
  total: number
  page: number
  perPage: number
}

export async function searchByBibNumbers(
  bibNumbers: string[],
  filters: {
    eventId?: string
    dateFrom?: string
    dateTo?: string
    minConfidence?: number
    status?: string
  },
  page = 1,
  perPage = 24,
): Promise<SearchResult> {
  const where = {
    detections: {
      some: {
        bibNumber: { in: bibNumbers },
        ...(filters.minConfidence !== undefined && { confidenceScore: { gte: filters.minConfidence } }),
        ...(filters.status && { status: filters.status as 'verified' | 'unverified' | 'rejected' }),
      },
    },
    ...(filters.eventId && { eventId: filters.eventId }),
    ...(filters.dateFrom || filters.dateTo
      ? {
          detectedAt: {
            ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
            ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
          },
        }
      : {}),
  }

  const [photos, total] = await Promise.all([
    prisma.photo.findMany({
      where,
      include: {
        detections: {
          where: { bibNumber: { in: bibNumbers } },
          select: { id: true, bibNumber: true, confidenceScore: true, status: true },
        },
      },
      orderBy: { detectedAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.photo.count({ where }),
  ])

  return { photos, total, page, perPage }
}
