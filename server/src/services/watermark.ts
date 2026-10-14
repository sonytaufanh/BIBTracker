import sharp from 'sharp'
import path from 'node:path'
import { prisma } from '../config/prisma.js'
import { getStorageAdapter } from './storage/adapter-factory.js'
import type { StorageAdapter, WatermarkPosition } from '../types.js'

export async function applyWatermark(
  imageBuffer: Buffer,
  logoPath: string,
  options: {
    position?: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center'
    opacity?: number
  } = {},
): Promise<Buffer> {
  const { position = 'bottom_right', opacity = 0.8 } = options

  let logoBuffer: Buffer
  try {
    const fs = await import('node:fs/promises')
    logoBuffer = await fs.readFile(path.resolve(process.cwd(), logoPath))
  } catch {
    return imageBuffer
  }

  const logoMetadata = await sharp(logoBuffer).metadata()
  const imageMetadata = await sharp(imageBuffer).metadata()

  const logoWidth = Math.min(logoMetadata.width ?? 200, (imageMetadata.width ?? 1920) * 0.2)
  const resizedLogo = await sharp(logoBuffer)
    .resize({ width: Math.round(logoWidth) })
    .composite([{ input: Buffer.from([255, 255, 255, Math.round(255 * opacity)]), blend: 'dest-in' }])
    .png()
    .toBuffer()

  const gravity: Record<string, string> = {
    top_left: 'northwest',
    top_right: 'northeast',
    bottom_left: 'southwest',
    bottom_right: 'southeast',
    center: 'center',
  }

  return sharp(imageBuffer)
    .composite([{ input: resizedLogo, gravity: gravity[position] as string, blend: 'over' }])
    .jpeg({ quality: 90 })
    .toBuffer()
}

export async function bulkExportWithWatermark(
  photoIds: string[],
  eventId: string,
): Promise<{ downloadUrl: string; count: number }> {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event?.watermarkEnabled || !event.watermarkLogoUrl) {
    return { downloadUrl: '', count: 0 }
  }

  const photos = await prisma.photo.findMany({ where: { id: { in: photoIds } } })
  const storage = getStorageAdapter((photos[0]?.storageAdapter ?? 'local') as StorageAdapter)

  const watermarkedBuffers: Buffer[] = []
  for (const photo of photos) {
    try {
      const buffer = await storage.download(photo.sourcePath)
      const watermarked = await applyWatermark(buffer, event.watermarkLogoUrl, {
        position: event.watermarkPosition as WatermarkPosition,
        opacity: event.watermarkOpacity,
      })
      watermarkedBuffers.push(watermarked)
    } catch (error) {
      console.error(`[Watermark] Failed for ${photo.filename}:`, error)
    }
  }

  return { downloadUrl: '', count: watermarkedBuffers.length }
}
