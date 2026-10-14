import type { ReadStream } from 'fs'

export interface StorageFile {
  filename: string
  path: string
  size: number
  mimeType: string
  modifiedAt: Date
}

export interface StorageAdapter {
  list(prefix?: string): Promise<StorageFile[]>
  download(path: string): Promise<Buffer>
  upload(path: string, data: Buffer, mimeType?: string): Promise<string>
  delete(path: string): Promise<void>
  getPublicUrl(path: string): string
}
