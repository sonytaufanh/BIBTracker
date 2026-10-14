import { Router } from 'express'
import { prisma } from '../config/prisma.js'
import { signToken, hashPassword, comparePassword } from '../utils/jwt.js'
import { authenticate } from '../middleware/auth.js'
import { asyncHandler as wrap, ApiError } from '../middleware/error-handler.js'

export const authRoutes = Router()

authRoutes.post(
  '/login',
  wrap(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string }
    if (!email || !password) throw new ApiError(400, 'Email and password required')

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new ApiError(401, 'Invalid credentials')

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) throw new ApiError(401, 'Invalid credentials')

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, event_ids: [] },
    })
  }),
)

authRoutes.get(
  '/me',
  authenticate,
  wrap(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        events: { select: { eventId: true } },
      },
    })
    if (!user) throw new ApiError(404, 'User not found')
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      event_ids: user.events.map((e) => e.eventId),
    })
  }),
)

authRoutes.post(
  '/register',
  wrap(async (req, res) => {
    const { email, password, name } = req.body as { email: string; password: string; name: string }
    if (!email || !password || !name) throw new ApiError(400, 'Email, password, and name required')

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new ApiError(409, 'Email already registered')

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role: 'viewer' },
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, event_ids: [] },
    })
  }),
)
