import multer from 'multer'
import path from 'node:path'
import crypto from 'node:crypto'
import { config } from '../config/index.js'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), 'storage', 'uploads'))
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`
    cb(null, name)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if ((config.upload.allowedMimes as readonly string[]).includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`))
    }
  },
})

export const uploadSingle = (field: string) => upload.single(field)
export const uploadMultiple = (field: string, max: number) => upload.array(field, max)
