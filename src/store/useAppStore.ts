import { create } from 'zustand'
import type { RaceEvent, OCREngine, StorageAdapter, AppUser } from '@/types'

interface AppState {
  user: AppUser | null
  currentEvent: RaceEvent | null
  ocrEngine: OCREngine
  storageAdapter: StorageAdapter
  sidebarOpen: boolean
  kioskMode: boolean

  setUser: (user: AppUser | null) => void
  setCurrentEvent: (event: RaceEvent | null) => void
  setOcrEngine: (engine: OCREngine) => void
  setStorageAdapter: (adapter: StorageAdapter) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setKioskMode: (enabled: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentEvent: null,
  ocrEngine: (import.meta.env.VITE_OCR_ENGINE as OCREngine) ?? 'local',
  storageAdapter: (import.meta.env.VITE_STORAGE_ADAPTER as StorageAdapter) ?? 'local',
  sidebarOpen: true,
  kioskMode: false,

  setUser: (user) => set({ user }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setOcrEngine: (engine) => set({ ocrEngine: engine }),
  setStorageAdapter: (adapter) => set({ storageAdapter: adapter }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setKioskMode: (enabled) => set({ kioskMode: enabled }),
}))
