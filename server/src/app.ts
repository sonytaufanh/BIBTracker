import express from 'express'
import cors from 'cors'
import compression from 'compression'
import { config } from './config/index.js'
import { errorHandler } from './middleware/error-handler.js'
import { authRoutes } from './routes/auth.routes.js'
import { eventRoutes } from './routes/events.routes.js'
import { photoRoutes } from './routes/photos.routes.js'
import { searchRoutes } from './routes/search.routes.js'
import { detectionRoutes } from './routes/detections.routes.js'
import { reviewQueueRoutes } from './routes/review-queue.routes.js'
import { participantRoutes } from './routes/participants.routes.js'
import { ocrRoutes } from './routes/ocr.routes.js'
import { dashboardRoutes } from './routes/dashboard.routes.js'
import { ingestionRoutes } from './routes/ingestion.routes.js'
import { shareRoutes } from './routes/share.routes.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: config.cors.origins, credentials: true }))
  app.use(compression())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/events', eventRoutes)
  app.use('/api/photos', photoRoutes)
  app.use('/api/search', searchRoutes)
  app.use('/api/detections', detectionRoutes)
  app.use('/api/review-queue', reviewQueueRoutes)
  app.use('/api/participants', participantRoutes)
  app.use('/api/ocr', ocrRoutes)
  app.use('/api/dashboard', dashboardRoutes)
  app.use('/api/ingestion', ingestionRoutes)
  app.use('/api/share', shareRoutes)

  app.use(errorHandler)

  return app
}
