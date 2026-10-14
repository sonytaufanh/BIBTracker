import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { verifyToken } from '../utils/jwt.js'
import { prisma } from '../config/prisma.js'
import type { UserRole } from '../types.js'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
        name: string
      }
    }
  }
}

export const authenticate: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = header.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, name: true },
  })

  if (!user) {
    res.status(401).json({ error: 'User not found' })
    return
  }

  req.user = user
  next()
}

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }
    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ error: 'Insufficient permissions' })
      return
    }
    next()
  }
}

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7)
    const payload = verifyToken(token)
    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, name: true },
      })
      if (user) req.user = user
    }
  }
  next()
}
