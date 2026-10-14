import sharp from 'sharp'
import { config } from '../../config/index.js'
import type { RawDetection } from '../../utils/bib-parser.js'

export interface PreprocessResult {
  buffer: Buffer
  width: number
  height: number
}

export async function preprocessImage(input: Buffer | string): Promise<PreprocessResult> {
  let image = sharp(input)
  const metadata = await image.metadata()

  if (metadata.width && metadata.width > config.ocr.maxImageSize) {
    image = image.resize({ width: config.ocr.maxImageSize, withoutEnlargement: true })
  }

  const processed = await image
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1.2 })
    .linear(1.3, -30)
    .median(1)
    .toFormat('png')
    .toBuffer({ resolveWithObject: true })

  return {
    buffer: processed.data,
    width: processed.info.width,
    height: processed.info.height,
  }
}

export async function extractROI(
  input: Buffer,
  bbox: { x: number; y: number; width: number; height: number },
): Promise<Buffer> {
  return sharp(input)
    .extract({
      left: Math.max(0, Math.round(bbox.x)),
      top: Math.max(0, Math.round(bbox.y)),
      width: Math.round(bbox.width),
      height: Math.round(bbox.height),
    })
    .toBuffer()
}

export async function generateThumbnail(input: Buffer | string, size = 400): Promise<Buffer> {
  return sharp(input)
    .resize({ width: size, height: Math.round((size * 3) / 4), fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer()
}

export async function getImageMetadata(input: Buffer | string) {
  const meta = await sharp(input).metadata()
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? 'unknown',
    size: meta.size ?? 0,
  }
}

export function convertDetectionsToRaw(
  words: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }>,
): RawDetection[] {
  return words.map((w) => ({
    text: w.text,
    confidence: w.confidence / 100,
    bbox: {
      x: w.bbox.x0,
      y: w.bbox.y0,
      width: w.bbox.x1 - w.bbox.x0,
      height: w.bbox.y1 - w.bbox.y0,
    },
  }))
}
