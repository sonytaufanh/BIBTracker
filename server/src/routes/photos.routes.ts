import { Router } from 'express'
import { prisma } from '../config/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../middleware/error-handler.js'
import { getStorageAdapter } from '../services/storage/adapter-factory.js'
import type { StorageAdapter } from '../types.js'

export const photoRoutes = Router()

photoRoutes.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1
    const perPage = Number(req.query.per_page) || 24
    const eventId = req.query.event_id as string | undefined

    const where = eventId ? { eventId } : {}
    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        include: { detections: { select: { id: true, bibNumber: true, confidenceScore: true, status: true } } },
        orderBy: { detectedAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.photo.count({ where }),
    ])

    res.json({
      data: photos,
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    })
  }),
)

photoRoutes.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const photo = await prisma.photo.findUnique({
      where: { id: String(req.params.id) },
      include: { detections: true, checkpoint: true },
    })
    if (!photo) throw new ApiError(404, 'Photo not found')
    res.json(photo)
  }),
)

photoRoutes.get(
  '/:id/download',
  authenticate,
  asyncHandler(async (req, res) => {
    const photo = await prisma.photo.findUnique({ where: { id: String(req.params.id) } })
    if (!photo) throw new ApiError(404, 'Photo not found')

    const storage = getStorageAdapter(photo.storageAdapter as StorageAdapter)
    const buffer = await storage.download(photo.sourcePath)
    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Content-Disposition', `attachment; filename="${photo.filename}"`)
    res.send(buffer)
  }),
)

photoRoutes.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    await prisma.photo.delete({ where: { id: String(req.params.id) } })
    res.json({ success: true })
  }),
)

photoRoutes.delete(
  '/bulk',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { ids } = req.body as { ids: string[] }
    if (!ids?.length) throw new ApiError(400, 'ids array required')
    const result = await prisma.photo.deleteMany({ where: { id: { in: ids } } })
    res.json({ success: true, deleted: result.count })
  }),
)

photoRoutes.post(
  '/bulk-download',
  authenticate,
  asyncHandler(async (req, res) => {
    const { ids } = req.body as { ids: string[] }
    if (!ids?.length) throw new ApiError(400, 'ids array required')

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', 'attachment; filename="bibtracker-photos.zip"')
    res.status(202).json({ message: 'Bulk download queued. Use the export job endpoint for large batches.' })
  }),
)
