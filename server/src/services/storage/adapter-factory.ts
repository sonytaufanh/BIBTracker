import type { StorageAdapter } from './index.js'
import { LocalStorageAdapter } from './local.js'
import { config } from '../../config/index.js'
import type { StorageAdapter as StorageAdapterType } from '../../types.js'

const adapters: Map<string, StorageAdapter> = new Map()

export function getStorageAdapter(type: StorageAdapterType = 'local'): StorageAdapter {
  const cached = adapters.get(type)
  if (cached) return cached

  let adapter: StorageAdapter
  switch (type) {
    case 'local':
      adapter = new LocalStorageAdapter()
      break
    case 'gdrive':
      throw new Error('Google Drive adapter not yet implemented. Use "local" for now.')
    case 's3':
      throw new Error('S3 adapter not yet implemented. Use "local" for now.')
    case 'r2':
      throw new Error('Cloudflare R2 adapter not yet implemented. Use "local" for now.')
    default:
      adapter = new LocalStorageAdapter()
  }

  adapters.set(type, adapter)
  return adapter
}
