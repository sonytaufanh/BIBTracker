import { Router } from 'express'
import { prisma } from '../config/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../middleware/error-handler.js'
import { syncPhotos } from '../services/ingestion.js'
import type { StorageAdapter as StorageAdapterType } from '../types.js'

export const ingestionRoutes = Router()

ingestionRoutes.post(
  '/sync',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req, res) => {
    const { event_id, adapter } = req.body as { event_id: string; adapter?: string }
    if (!event_id) throw new ApiError(400, 'event_id required')

    const event = await prisma.event.findUnique({ where: { id: event_id } })
    if (!event) throw new ApiError(404, 'Event not found')

    const adapterType = (adapter || 'local') as StorageAdapterType
    const prefix = req.body.prefix as string | undefined

    const result = await syncPhotos(event_id, adapterType, prefix)

    res.json({
      success: true,
      ...result,
    })
  }),
)

ingestionRoutes.get(
  '/status/:eventId',
  authenticate,
  asyncHandler(async (req, res) => {
    const logs = await prisma.ingestionLog.findMany({
      where: { eventId: String(req.params.eventId) },
      orderBy: { startedAt: 'desc' },
      take: 10,
    })

    const pendingPhotos = await prisma.photo.count({
      where: { eventId: String(req.params.eventId), processingStatus: 'pending' },
    })

    const indexedPhotos = await prisma.photo.count({
      where: { eventId: String(req.params.eventId), processingStatus: 'indexed' },
    })

    const failedPhotos = await prisma.photo.count({
      where: { eventId: String(req.params.eventId), processingStatus: 'failed' },
    })

    res.json({
      logs,
      pending_photos: pendingPhotos,
      indexed_photos: indexedPhotos,
      failed_photos: failedPhotos,
    })
  }),
)
