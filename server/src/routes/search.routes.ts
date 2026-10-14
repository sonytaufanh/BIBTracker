import { Router } from 'express'
import { searchByBibNumbers } from '../services/search.js'
import { authenticate, optionalAuth } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../middleware/error-handler.js'

export const searchRoutes = Router()

searchRoutes.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const {
      bib_numbers,
      event_id,
      date_from,
      date_to,
      min_confidence,
      status,
      page = 1,
      per_page = 24,
    } = req.body

    if (!bib_numbers?.length) throw new ApiError(400, 'bib_numbers array required')

    const result = await searchByBibNumbers(
      bib_numbers,
      { eventId: event_id, dateFrom: date_from, dateTo: date_to, minConfidence: min_confidence, status },
      page,
      per_page,
    )

    res.json(result)
  }),
)
