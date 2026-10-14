import { v4 as uuidv4 } from 'uuid'
import crypto from 'node:crypto'
import { prisma } from '../config/prisma.js'
import { getStorageAdapter } from './storage/adapter-factory.js'
import { generateThumbnail, getImageMetadata } from './ocr/preprocess.js'
import type { StorageAdapter as StorageAdapterType, IngestionStatus } from '../types.js'

export async function syncPhotos(
  eventId: string,
  adapterType: StorageAdapterType = 'local',
  prefix?: string,
) {
  const storage = getStorageAdapter(adapterType)
  const files = await storage.list(prefix)

  const imageFiles = files.filter((f) =>
    /\.(jpg|jpeg|png|webp|heic)$/i.test(f.filename),
  )

  const log = await prisma.ingestionLog.create({
    data: {
      id: uuidv4(),
      eventId,
      adapter: adapterType,
      status: 'syncing',
      filesFound: imageFiles.length,
      startedAt: new Date(),
    },
  })

  let synced = 0
  let skipped = 0
  let failed = 0

  for (const file of imageFiles) {
    try {
      const checksum = await calculateChecksum(storage, file.path)

      const existing = await prisma.photo.findUnique({ where: { checksum } })
      if (existing) {
        skipped++
        continue
      }

      const buffer = await storage.download(file.path)
      const metadata = await getImageMetadata(buffer)
      const thumbnailBuffer = await generateThumbnail(buffer)
      const thumbnailPath = `thumbnails/${file.path}`
      await storage.upload(thumbnailPath, thumbnailBuffer, 'image/jpeg')

      const exifTimestamp = await extractTimestampFromFilename(file.filename)

      await prisma.photo.create({
        data: {
          id: uuidv4(),
          eventId,
          filename: file.filename,
          sourcePath: file.path,
          thumbnailUrl: storage.getPublicUrl(thumbnailPath),
          fullUrl: storage.getPublicUrl(file.path),
          storageAdapter: adapterType,
          fileSize: file.size,
          width: metadata.width,
          height: metadata.height,
          exifTimestamp,
          processingStatus: 'pending',
          checksum,
        },
      })
      synced++
    } catch (error) {
      console.error(`[Ingestion] Failed to sync ${file.filename}:`, error)
      failed++
    }
  }

  await prisma.ingestionLog.update({
    where: { id: log.id },
    data: {
      status: 'completed' as IngestionStatus,
      filesSynced: synced,
      filesSkipped: skipped,
      filesFailed: failed,
      completedAt: new Date(),
    },
  })

  return { total: imageFiles.length, synced, skipped, failed }
}

async function calculateChecksum(storage: { download: (p: string) => Promise<Buffer> }, path: string): Promise<string> {
  const buffer = await storage.download(path)
  return crypto.createHash('md5').update(buffer).digest('hex')
}

async function extractTimestampFromFilename(filename: string): Promise<Date | null> {
  const patterns = [
    /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/,
    /(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/,
    /IMG_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/,
  ]

  for (const pattern of patterns) {
    const match = filename.match(pattern)
    if (match) {
      const [, year, month, day, hour, min, sec] = match
      const date = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`)
      if (!isNaN(date.getTime())) return date
    }
  }

  return null
}
