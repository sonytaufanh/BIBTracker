export interface RawDetection {
  text: string
  confidence: number
  bbox?: { x: number; y: number; width: number; height: number }
}

export interface ParsedBIB {
  bibNumber: string
  confidence: number
  bbox?: { x: number; y: number; width: number; height: number }
}

const BIB_PATTERN = /\b(\d{1,6})\b/g
const EXCLUDE_PATTERNS = [
  /^(19|20)\d{2}$/,
  /^\d{1,2}$/,
  /^\d{10,}$/,
]

export function parseBibNumbers(detections: RawDetection[]): ParsedBIB[] {
  const results: ParsedBIB[] = []
  const seen = new Set<string>()

  for (const det of detections) {
    const matches = det.text.matchAll(BIB_PATTERN)
    for (const match of matches) {
      const num = match[1]
      if (EXCLUDE_PATTERNS.some((p) => p.test(num))) continue
      if (seen.has(num)) {
        const existing = results.find((r) => r.bibNumber === num)
        if (existing && det.confidence > existing.confidence) {
          existing.confidence = det.confidence
          if (det.bbox) existing.bbox = det.bbox
        }
        continue
      }
      seen.add(num)
      results.push({
        bibNumber: num,
        confidence: det.confidence,
        bbox: det.bbox,
      })
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence)
}

export function sanitizeBibNumber(raw: string): string {
  return raw.replace(/\D/g, '')
}
