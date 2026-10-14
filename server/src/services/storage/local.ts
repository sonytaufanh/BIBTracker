import fs from 'node:fs/promises'
import path from 'node:path'
import { createReadStream, type ReadStream } from 'node:fs'
import { config } from '../../config/index.js'
import type { StorageAdapter, StorageFile } from './index.js'

export class LocalStorageAdapter implements StorageAdapter {
  private rootPath: string

  constructor(rootPath: string = config.storage.localRootPath) {
    this.rootPath = path.resolve(rootPath)
  }

  async list(prefix?: string): Promise<StorageFile[]> {
    const dir = prefix ? path.join(this.rootPath, prefix) : this.rootPath
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files: StorageFile[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subFiles = await this.list(path.join(prefix ?? '', entry.name))
        files.push(...subFiles)
      } else if (entry.isFile()) {
        const fullPath = path.join(dir, entry.name)
        const stat = await fs.stat(fullPath)
        files.push({
          filename: entry.name,
          path: path.relative(this.rootPath, fullPath).replace(/\\/g, '/'),
          size: stat.size,
          mimeType: getMimeType(entry.name),
          modifiedAt: stat.mtime,
        })
      }
    }
    return files
  }

  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.rootPath, filePath)
    return fs.readFile(fullPath)
  }

  async upload(filePath: string, data: Buffer, mimeType?: string): Promise<string> {
    const fullPath = path.join(this.rootPath, filePath)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, data)
    return filePath
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.rootPath, filePath)
    await fs.unlink(fullPath)
  }

  getPublicUrl(filePath: string): string {
    return `/storage/photos/${filePath}`
  }

  createReadStream(filePath: string): ReadStream {
    return createReadStream(path.join(this.rootPath, filePath))
  }
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
    '.gif': 'image/gif',
  }
  return types[ext] ?? 'application/octet-stream'
}
