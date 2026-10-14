import { createWorker, type Worker } from 'tesseract.js'
import { config } from '../../config/index.js'
import { convertDetectionsToRaw, type PreprocessResult } from './preprocess.js'
import { parseBibNumbers, type ParsedBIB, type RawDetection } from '../../utils/bib-parser.js'

let workerInstance: Worker | null = null

async function getWorker(): Promise<Worker> {
  if (!workerInstance) {
    workerInstance = await createWorker(config.ocr.tesseractLang)
  }
  return workerInstance
}

export interface TesseractResult {
  bibs: ParsedBIB[]
  rawText: string
  rawDetections: RawDetection[]
}

export async function runTesseractOCR(image: PreprocessResult): Promise<TesseractResult> {
  const worker = await getWorker()

  const result = await worker.recognize(image.buffer)

  const words = (result.data as unknown as { words?: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }> }).words ?? []
  const rawDetections = convertDetectionsToRaw(words)
  const bibs = parseBibNumbers(rawDetections)

  const scale = image.width > 0 ? 1 : 1
  const scaledBibs = bibs.map((b) => ({
    ...b,
    bbox: b.bbox
      ? {
          x: b.bbox.x * scale,
          y: b.bbox.y * scale,
          width: b.bbox.width * scale,
          height: b.bbox.height * scale,
        }
      : undefined,
  }))

  return {
    bibs: scaledBibs,
    rawText: result.data.text,
    rawDetections,
  }
}

export async function terminateTesseract(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate()
    workerInstance = null
  }
}
