import { Router } from 'express'
import { prisma } from '../config/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../middleware/error-handler.js'

export const eventRoutes = Router()

eventRoutes.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
      include: { _count: { select: { photos: true, participants: true } } },
    })
    const total = events.length
    res.json({ data: events, total, page: 1, per_page: total, total_pages: 1 })
  }),
)

eventRoutes.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const event = await prisma.event.findUnique({
      where: { id: String(req.params.id) },
      include: {
        checkpoints: { orderBy: { sequence: 'asc' } },
        _count: { select: { photos: true, participants: true } },
      },
    })
    if (!event) throw new ApiError(404, 'Event not found')
    res.json(event)
  }),
)

eventRoutes.post(
  '/',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { name, slug, eventDate, location, description, logoUrl } = req.body
    if (!name || !slug || !eventDate) throw new ApiError(400, 'name, slug, eventDate required')

    const existing = await prisma.event.findUnique({ where: { slug } })
    if (existing) throw new ApiError(409, 'Slug already exists')

    const event = await prisma.event.create({
      data: { name, slug, eventDate: new Date(eventDate), location, description, logoUrl },
    })
    res.status(201).json(event)
  }),
)

eventRoutes.put(
  '/:id',
  authenticate,
  requireRole('admin', 'operator'),
  asyncHandler(async (req, res) => {
    const { name, slug, eventDate, status, location, description, logoUrl, watermarkLogoUrl, watermarkEnabled, watermarkPosition, watermarkOpacity } = req.body
    const event = await prisma.event.update({
      where: { id: String(req.params.id) },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
        ...(status !== undefined && { status }),
        ...(location !== undefined && { location }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(watermarkLogoUrl !== undefined && { watermarkLogoUrl }),
        ...(watermarkEnabled !== undefined && { watermarkEnabled }),
        ...(watermarkPosition !== undefined && { watermarkPosition }),
        ...(watermarkOpacity !== undefined && { watermarkOpacity }),
      },
    })
    res.json(event)
  }),
)

eventRoutes.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    await prisma.event.delete({ where: { id: String(req.params.id) } })
    res.json({ success: true })
  }),
)
