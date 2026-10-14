import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../config/prisma.js'
import { optionalAuth } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../middleware/error-handler.js'

export const shareRoutes = Router()

shareRoutes.post(
  '/',
  asyncHandler(async (req, res) => {
    const { bib_number, event_id } = req.body as { bib_number: string; event_id: string }
    if (!bib_number || !event_id) throw new ApiError(400, 'bib_number and event_id required')

    const token = uuidv4()
    const link = await prisma.shareableLink.create({
      data: {
        token,
        bibNumber: bib_number,
        eventId: event_id,
      },
    })
    res.status(201).json(link)
  }),
)

shareRoutes.get(
  '/:token',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const link = await prisma.shareableLink.findUnique({
      where: { token: String(req.params.token) },
    })
    if (!link) throw new ApiError(404, 'Shareable link not found')
    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new ApiError(410, 'This link has expired')
    }

    await prisma.shareableLink.update({
      where: { id: link.id },
      data: { viewCount: { increment: 1 } },
    })

    const photos = await prisma.photo.findMany({
      where: {
        eventId: link.eventId,
        detections: { some: { bibNumber: link.bibNumber } },
      },
      include: {
        detections: {
          where: { bibNumber: link.bibNumber },
          select: { id: true, bibNumber: true, confidenceScore: true, status: true },
        },
      },
      orderBy: { detectedAt: 'asc' },
    })

    res.json(photos)
  }),
)
