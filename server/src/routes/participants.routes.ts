import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../config/prisma.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { asyncHandler, ApiError } from '../middleware/error-handler.js'
import { uploadSingle } from '../middleware/upload.js'
import { config } from '../config/index.js'

export const participantRoutes = Router()

participantRoutes.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1
    const perPage = Number(req.query.per_page) || 50
    const eventId = req.query.event_id as string | undefined

    const where = eventId ? { eventId } : {}
    const [participants, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        orderBy: { bibNumber: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.participant.count({ where }),
    ])

    const participantsWithCount = await Promise.all(
      participants.map(async (p) => ({
        ...p,
        photo_count: await prisma.bIBDetection.count({
          where: { participantId: p.id, status: { not: 'rejected' } },
        }),
      })),
    )

    res.json({
      data: participantsWithCount,
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    })
  }),
)

participantRoutes.get(
  '/bib/:bibNumber',
  authenticate,
  asyncHandler(async (req, res) => {
    const eventId = req.query.event_id as string
    if (!eventId) throw new ApiError(400, 'event_id query param required')

    const participant = await prisma.participant.findFirst({
      where: { bibNumber: String(req.params.bibNumber), eventId },
    })
    if (!participant) throw new ApiError(404, 'Participant not found')

    const photoCount = await prisma.bIBDetection.count({
      where: { participantId: participant.id, status: { not: 'rejected' } },
    })

    res.json({ ...participant, photo_count: photoCount })
  }),
)

participantRoutes.post(
  '/import',
  authenticate,
  requireRole('admin', 'operator'),
  uploadSingle('file'),
  asyncHandler(async (req, res) => {
    const eventId = req.body.event_id as string
    if (!eventId) throw new ApiError(400, 'event_id required')
    if (!req.file) throw new ApiError(400, 'CSV/Excel file required')

    const { parse } = await import('csv-parse/sync')
    const fs = await import('node:fs/promises')
    const content = await fs.readFile(req.file.path, 'utf-8')

    let records: Record<string, string>[] = []
    const ext = req.file.originalname.toLowerCase()
    if (ext.endsWith('.csv')) {
      records = parse(content, { columns: true, skip_empty_lines: true, trim: true })
    } else {
      throw new ApiError(400, 'Only CSV files supported currently. For Excel, convert to CSV first.')
    }

    const validColumns = ['bib_number', 'bib', 'full_name', 'name', 'gender', 'category', 'team', 'email', 'phone']
    const created: number[] = []
    let imported = 0
    let skipped = 0

    for (const row of records) {
      const bibNumber = row.bib_number || row.bib || row.BIB
      const fullName = row.full_name || row.name || row.Name
      if (!bibNumber || !fullName) {
        skipped++
        continue
      }

      const existing = await prisma.participant.findFirst({
        where: { eventId, bibNumber: String(bibNumber).trim() },
      })
      if (existing) {
        skipped++
        continue
      }

      await prisma.participant.create({
        data: {
          id: uuidv4(),
          eventId,
          bibNumber: String(bibNumber).trim(),
          fullName: String(fullName).trim(),
          gender: row.gender || row.Gender || null,
          category: row.category || row.Category || null,
          team: row.team || row.Team || null,
          email: row.email || row.Email || null,
          phone: row.phone || row.Phone || null,
        },
      })
      imported++
    }

    await import('node:fs/promises').then((fs) => fs.unlink(req.file!.path).catch(() => {}))

    res.json({
      success: true,
      imported,
      skipped,
      total: records.length,
    })
  }),
)

participantRoutes.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    await prisma.participant.delete({ where: { id: String(req.params.id) } })
    res.json({ success: true })
  }),
)
