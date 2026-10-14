import { Router } from 'express'
import { prisma } from '../config/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error-handler.js'

export const dashboardRoutes = Router()

dashboardRoutes.get(
  '/stats',
  authenticate,
  asyncHandler(async (req, res) => {
    const eventId = req.query.event_id as string | undefined

    const where = eventId ? { eventId } : {}

    const [totalPhotos, totalDetections, verifiedBibs, unverifiedBibs, uniqueRunners, photosWithoutBib] =
      await Promise.all([
        prisma.photo.count({ where }),
        prisma.bIBDetection.count({ where: { photo: where } }),
        prisma.bIBDetection.count({ where: { ...{ photo: where }, status: 'verified' } }),
        prisma.bIBDetection.count({ where: { ...{ photo: where }, status: 'unverified' } }),
        prisma.bIBDetection.groupBy({
          by: ['bibNumber'],
          where: { photo: where },
          _count: { bibNumber: true },
        }),
        prisma.photo.count({
          where: { ...where, detections: { none: {} } },
        }),
      ])

    const scanJobs = await prisma.oCRScanJob.findMany({
      where: { ...(eventId && { eventId }) },
      orderBy: { startedAt: 'desc' },
      take: 5,
    })

    res.json({
      total_photos: totalPhotos,
      total_bibs_detected: totalDetections,
      verified_bibs: verifiedBibs,
      unverified_bibs: unverifiedBibs,
      unique_runners: uniqueRunners.length,
      photos_without_bib: photosWithoutBib,
      ocr_progress: totalPhotos > 0 ? Math.round((verifiedBibs / totalPhotos) * 100) : 0,
      scan_jobs: scanJobs,
    })
  }),
)
