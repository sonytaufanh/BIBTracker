import { Router } from 'express'
import { prisma } from '../config/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error-handler.js'
import { config } from '../config/index.js'

export const reviewQueueRoutes = Router()

reviewQueueRoutes.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const eventId = req.query.event_id as string | undefined

    const lowConfidenceDetections = await prisma.bIBDetection.findMany({
      where: {
        status: 'unverified',
        confidenceScore: { lt: config.ocr.confidenceThreshold },
        ...(eventId && { photo: { eventId } }),
      },
      include: {
        photo: {
          select: {
            id: true,
            filename: true,
            thumbnailUrl: true,
            fullUrl: true,
            detectedAt: true,
            detections: {
              select: {
                id: true,
                bibNumber: true,
                confidenceScore: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { confidenceScore: 'asc' },
      take: 50,
    })

    const items = lowConfidenceDetections.map((d) => ({
      photo: d.photo,
      detections: d.photo.detections,
      suggested_bib: d.bibNumber,
    }))

    res.json(items)
  }),
)
