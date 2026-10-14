export const config = {
  port: Number(process.env.PORT) || 8000,
  jwtSecret: process.env.JWT_SECRET || 'bibtracker-dev-secret-change-in-production',
  jwtExpiresIn: '7d',

  ocr: {
    defaultEngine: process.env.OCR_DEFAULT_ENGINE || 'local',
    confidenceThreshold: Number(process.env.OCR_CONFIDENCE_THRESHOLD) || 0.7,
    reviewQueueThreshold: Number(process.env.OCR_REVIEW_THRESHOLD) || 0.6,
    geminiApiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '',
    tesseractLang: process.env.TESSERACT_LANG || 'eng',
    maxImageSize: Number(process.env.OCR_MAX_IMAGE_SIZE) || 4096,
  },

  storage: {
    defaultAdapter: process.env.STORAGE_DEFAULT_ADAPTER || 'local',
    localRootPath: process.env.STORAGE_LOCAL_PATH || './storage/photos',
    gdrive: {
      clientId: process.env.GDRIVE_CLIENT_ID || '',
      apiKey: process.env.GDRIVE_API_KEY || '',
    },
    s3: {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || '',
      accessKey: process.env.S3_ACCESS_KEY || '',
      secretKey: process.env.S3_SECRET_KEY || '',
    },
  },

  upload: {
    maxFileSize: Number(process.env.UPLOAD_MAX_SIZE) || 50 * 1024 * 1024,
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  },
} as const
