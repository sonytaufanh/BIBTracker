import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../../config/index.js'
import type { ParsedBIB } from '../../utils/bib-parser.js'

let client: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI {
  if (!config.ocr.geminiApiKey) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in environment.')
  }
  if (!client) {
    client = new GoogleGenerativeAI(config.ocr.geminiApiKey)
  }
  return client
}

const BIB_EXTRACTION_PROMPT = `You are a specialized AI for detecting runner bib numbers in race photos.

Analyze this photo and identify ALL visible runner bib numbers.

Return ONLY a JSON array (no markdown, no explanation) with this format:
[
  { "bib_number": "123", "confidence": 0.95, "bbox": { "x": 100, "y": 200, "width": 80, "height": 40 } }
]

Rules:
- bib_number: only the numeric ID printed on the bib (1-6 digits)
- confidence: your confidence level 0.0 to 1.0
- bbox: approximate bounding box of the bib in the image (pixel coordinates)
- If no bib numbers are visible, return: []
- Ignore numbers on shirts, signage, or timestamps
- Focus on official race bibs pinned to runners' chests`

export interface GeminiResult {
  bibs: ParsedBIB[]
  rawText: string
}

export async function runGeminiOCR(imageBuffer: Buffer, mimeType = 'image/jpeg'): Promise<GeminiResult> {
  const genAI = getClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const base64Image = imageBuffer.toString('base64')

  const result = await model.generateContent([
    { text: BIB_EXTRACTION_PROMPT },
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
  ])

  const responseText = result.response.text().trim()

  let bibs: ParsedBIB[] = []
  try {
    const cleaned = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(cleaned) as Array<{
      bib_number: string
      confidence: number
      bbox?: { x: number; y: number; width: number; height: number }
    }>

    bibs = parsed
      .filter((item) => item.bib_number && /^\d{1,6}$/.test(item.bib_number))
      .map((item) => ({
        bibNumber: item.bib_number,
        confidence: Math.min(1, Math.max(0, item.confidence)),
        bbox: item.bbox,
      }))
  } catch (e) {
    console.error('[Gemini OCR] Failed to parse response:', responseText, e)
  }

  return {
    bibs,
    rawText: responseText,
  }
}
