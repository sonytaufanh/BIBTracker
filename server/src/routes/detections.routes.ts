import { Router } from 'express'
import { prisma } from '../config/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../middleware/error-handler.js'
import { sanitizeBibNumber } from '../utils/bib-parser.js'

export const detectionRoutes = Router()

detectionRoutes.patch(
  '/:id/verify',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req, res) => {
    const { bib_number } = req.body as { bib_number: string }
    if (!bib_number) throw new ApiError(400, 'bib_number required')

    const detection = await prisma.bIBDetection.findUnique({ where: { id: String(req.params.id) } })
    if (!detection) throw new ApiError(404, 'Detection not found')

    const participant = await prisma.participant.findFirst({
      where: { eventId: { not: undefined }, bibNumber: bib_number },
    })

    const updated = await prisma.bIBDetection.update({
      where: { id: String(req.params.id) },
      data: {
        bibNumber: sanitizeBibNumber(bib_number),
        status: 'verified',
        verifiedAt: new Date(),
        verifiedById: req.user!.id,
        participantId: participant?.id ?? null,
      },
    })
    res.json(updated)
  }),
)

detectionRoutes.patch(
  '/:id/reject',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req, res) => {
    const detection = await prisma.bIBDetection.findUnique({ where: { id: String(req.params.id) } })
    if (!detection) throw new ApiError(404, 'Detection not found')

    const updated = await prisma.bIBDetection.update({
      where: { id: String(req.params.id) },
      data: {
        status: 'rejected',
        verifiedAt: new Date(),
        verifiedById: req.user!.id,
      },
    })
    res.json(updated)
  }),
)

detectionRoutes.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req, res) => {
    const { bib_number } = req.body as { bib_number: string }
    if (!bib_number) throw new ApiError(400, 'bib_number required')

    const updated = await prisma.bIBDetection.update({
      where: { id: String(req.params.id) },
      data: { bibNumber: sanitizeBibNumber(bib_number) },
    })
    res.json(updated)
  }),
)
