import { config } from '../../config/index.js'
import { preprocessImage, type PreprocessResult } from './preprocess.js'
import { runTesseractOCR } from './tesseract.js'
import { runGeminiOCR } from './gemini.js'
import { parseBibNumbers, type ParsedBIB } from '../../utils/bib-parser.js'
import type { OCREngine } from '../../types.js'

export interface OCRResult {
  bibs: ParsedBIB[]
  rawText: string
  engine: OCREngine
  processedImage: PreprocessResult
}

export async function runOCR(
  imageBuffer: Buffer,
  engine: OCREngine = config.ocr.defaultEngine as OCREngine,
): Promise<OCRResult> {
  const processedImage = await preprocessImage(imageBuffer)

  if (engine === 'gemini') {
    const result = await runGeminiOCR(imageBuffer)
    return {
      bibs: result.bibs,
      rawText: result.rawText,
      engine,
      processedImage,
    }
  }

  if (engine === 'cloudvision') {
    throw new Error('Cloud Vision engine not yet implemented. Use "local" or "gemini".')
  }

  const result = await runTesseractOCR(processedImage)
  return {
    bibs: result.bibs,
    rawText: result.rawText,
    engine: 'local',
    processedImage,
  }
}

export async function runOCRFromUrl(
  imageUrl: string,
  engine?: OCREngine,
): Promise<OCRResult> {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  return runOCR(buffer, engine)
}

export { parseBibNumbers }
export type { ParsedBIB }
