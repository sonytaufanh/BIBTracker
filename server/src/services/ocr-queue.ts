import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../config/prisma.js'
import { runOCR } from './ocr/index.js'
import { getStorageAdapter } from './storage/adapter-factory.js'
import { generateThumbnail, getImageMetadata } from './ocr/preprocess.js'
import { config } from '../config/index.js'
import type { OCREngine } from '../types.js'
import type { Photo } from '@prisma/client'
import type { StorageAdapter } from '../types.js'

interface QueueItem {
  photoId: string
  eventId: string
  engine: OCREngine
}

class OCRQueue {
  private queue: QueueItem[] = []
  private processing = false
  private activeJobs = new Map<string, { total: number; processed: number; detected: number }>()

  enqueue(photoId: string, eventId: string, engine: OCREngine) {
    this.queue.push({ photoId, eventId, engine })
    this.process()
  }

  enqueueBatch(photos: Photo[], eventId: string, engine: OCREngine) {
    for (const photo of photos) {
      this.queue.push({ photoId: photo.id, eventId, engine })
    }
    this.process()
  }

  getQueueSize(): number {
    return this.queue.length
  }

  isProcessing(): boolean {
    return this.processing
  }

  private async process() {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      const item = this.queue.shift()!
      try {
        await this.processPhoto(item)
      } catch (error) {
        console.error(`[OCR Queue] Failed to process photo ${item.photoId}:`, error)
        await prisma.photo.update({
          where: { id: item.photoId },
          data: {
            processingStatus: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        })
      }

      const job = this.activeJobs.get(item.eventId)
      if (job) {
        job.processed++
        if (job.processed >= job.total) {
          await this.completeJob(item.eventId)
        }
      }
    }

    this.processing = false
  }

  private async processPhoto(item: QueueItem) {
    const photo = await prisma.photo.findUnique({ where: { id: item.photoId } })
    if (!photo) return

    await prisma.photo.update({
      where: { id: photo.id },
      data: { processingStatus: 'preprocessing' },
    })

    const storage = getStorageAdapter(photo.storageAdapter as StorageAdapter)
    let imageBuffer: Buffer
    try {
      imageBuffer = await storage.download(photo.sourcePath)
    } catch {
      const resp = await fetch(photo.fullUrl)
      imageBuffer = Buffer.from(await resp.arrayBuffer())
    }

    await prisma.photo.update({
      where: { id: photo.id },
      data: { processingStatus: 'ocr_scanning' },
    })

    const ocrResult = await runOCR(imageBuffer, item.engine)

    await prisma.photo.update({
      where: { id: photo.id },
      data: { processingStatus: 'postprocessing' },
    })

    const detections = ocrResult.bibs
    const eventParticipants = await prisma.participant.findMany({
      where: { eventId: item.eventId },
      select: { id: true, bibNumber: true },
    })
    const participantMap = new Map(eventParticipants.map((p) => [p.bibNumber, p.id]))

    let detectedCount = 0
    for (const bib of detections) {
      const status = bib.confidence >= config.ocr.confidenceThreshold ? 'verified' : 'unverified'
      const participantId = participantMap.get(bib.bibNumber) ?? null

      await prisma.bIBDetection.create({
        data: {
          id: uuidv4(),
          photoId: photo.id,
          bibNumber: bib.bibNumber,
          confidenceScore: bib.confidence,
          status,
          ocrEngine: ocrResult.engine,
          bboxX: bib.bbox?.x,
          bboxY: bib.bbox?.y,
          bboxWidth: bib.bbox?.width,
          bboxHeight: bib.bbox?.height,
          detectedAt: photo.detectedAt ?? new Date(),
          participantId,
        },
      })
      detectedCount++
    }

    await prisma.photo.update({
      where: { id: photo.id },
      data: {
        processingStatus: 'indexed',
        detectedAt: photo.detectedAt ?? new Date(),
      },
    })

    const job = this.activeJobs.get(item.eventId)
    if (job) {
      job.detected += detectedCount
    }

    await prisma.oCRScanJob.updateMany({
      where: { eventId: item.eventId, status: 'scanning' },
      data: {
        processedPhotos: { increment: 1 },
        detectedBibs: { increment: detectedCount },
      },
    })
  }

  async startJob(eventId: string, engine: OCREngine, totalPhotos: number): Promise<string> {
    const jobId = uuidv4()
    this.activeJobs.set(eventId, { total: totalPhotos, processed: 0, detected: 0 })

    await prisma.oCRScanJob.create({
      data: {
        id: jobId,
        eventId,
        engine,
        status: 'scanning',
        totalPhotos,
        processedPhotos: 0,
        detectedBibs: 0,
      },
    })

    return jobId
  }

  private async completeJob(eventId: string) {
    const stats = this.activeJobs.get(eventId)
    if (!stats) return

    await prisma.oCRScanJob.updateMany({
      where: { eventId, status: 'scanning' },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    })

    this.activeJobs.delete(eventId)
    console.log(`[OCR Queue] Job completed for event ${eventId}: ${stats.detected} BIBs detected from ${stats.processed} photos`)
  }

  async stop() {
    this.queue = []
    this.processing = false
  }
}

export const ocrQueue = new OCRQueue()
