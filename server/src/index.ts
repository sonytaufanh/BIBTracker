import { createApp } from './app.js'
import { config } from './config/index.js'
import { ocrQueue } from './services/ocr-queue.js'

const app = createApp()
const server = app.listen(config.port, () => {
  console.log(`[BIBTracker API] Server running on http://localhost:${config.port}`)
  console.log(`[BIBTracker API] Environment: ${process.env.NODE_ENV ?? 'development'}`)
})

process.on('SIGTERM', async () => {
  console.log('[BIBTracker API] SIGTERM received, shutting down...')
  await ocrQueue.stop()
  server.close(() => process.exit(0))
})

process.on('SIGINT', async () => {
  console.log('[BIBTracker API] SIGINT received, shutting down...')
  await ocrQueue.stop()
  server.close(() => process.exit(0))
})
