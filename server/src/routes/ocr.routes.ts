import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../config/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../middleware/error-handler.js'
import { ocrQueue } from '../services/ocr-queue.js'
import { config } from '../config/index.js'
import type { OCREngine } from '../types.js'

export const ocrRoutes = Router()

ocrRoutes.post(
  '/scan',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req, res) => {
    const { event_id, engine } = req.body as { event_id: string; engine?: string }
    if (!event_id) throw new ApiError(400, 'event_id required')

    const event = await prisma.event.findUnique({ where: { id: event_id } })
    if (!event) throw new ApiError(404, 'Event not found')

    const ocrEngine = (engine || config.ocr.defaultEngine) as OCREngine
    if (ocrEngine === 'gemini' && !config.ocr.geminiApiKey) {
      throw new ApiError(400, 'Gemini API key not configured. Set GEMINI_API_KEY or use engine "local".')
    }

    const pendingPhotos = await prisma.photo.findMany({
      where: {
        eventId: event_id,
        processingStatus: { in: ['pending', 'failed'] },
      },
    })

    if (pendingPhotos.length === 0) {
      const existingJob = await prisma.oCRScanJob.findFirst({
        where: { eventId: event_id, status: 'scanning' },
        orderBy: { startedAt: 'desc' },
      })
      if (existingJob) {
        res.json(existingJob)
        return
      }
      throw new ApiError(409, 'No pending photos to scan. All photos are already indexed.')
    }

    const jobId = await ocrQueue.startJob(event_id, ocrEngine, pendingPhotos.length)
    ocrQueue.enqueueBatch(pendingPhotos, event_id, ocrEngine)

    const job = await prisma.oCRScanJob.findUnique({ where: { id: jobId } })
    res.status(202).json(job)
  }),
)

ocrRoutes.get(
  '/jobs/:jobId',
  authenticate,
  asyncHandler(async (req, res) => {
    const job = await prisma.oCRScanJob.findUnique({ where: { id: String(req.params.jobId) } })
    if (!job) throw new ApiError(404, 'Scan job not found')
    res.json(job)
  }),
)

ocrRoutes.get(
  '/jobs',
  authenticate,
  asyncHandler(async (req, res) => {
    const eventId = req.query.event_id as string | undefined
    const activeOnly = req.query.active === 'true'

    const where = {
      ...(eventId && { eventId }),
      ...(activeOnly && { status: 'scanning' as const }),
    }

    const jobs = await prisma.oCRScanJob.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: 20,
    })
    res.json(jobs)
  }),
)

ocrRoutes.post(
  '/scan-single/:photoId',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req, res) => {
    const { engine } = req.body as { engine?: string }
    const photo = await prisma.photo.findUnique({ where: { id: String(req.params.photoId) } })
    if (!photo) throw new ApiError(404, 'Photo not found')

    const ocrEngine = (engine || config.ocr.defaultEngine) as OCREngine
    ocrQueue.enqueue(photo.id, photo.eventId, ocrEngine)

    res.status(202).json({
      success: true,
      message: 'Photo queued for OCR processing',
      photo_id: photo.id,
      engine: ocrEngine,
      queue_size: ocrQueue.getQueueSize(),
    })
  }),
)

ocrRoutes.get(
  '/status',
  authenticate,
  asyncHandler(async (_req, res) => {
    res.json({
      queue_size: ocrQueue.getQueueSize(),
      is_processing: ocrQueue.isProcessing(),
      default_engine: config.ocr.defaultEngine,
      gemini_configured: !!config.ocr.geminiApiKey,
    })
  }),
)
