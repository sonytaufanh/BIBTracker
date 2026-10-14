import { ScanText, Cloud, KeyRound, Database, HardDrive, Image as ImageIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OCR_ENGINE_OPTIONS, STORAGE_ADAPTER_OPTIONS } from '@/lib/constants'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const ocrEngine = useAppStore((s) => s.ocrEngine)
  const setOcrEngine = useAppStore((s) => s.setOcrEngine)
  const storageAdapter = useAppStore((s) => s.storageAdapter)
  const setStorageAdapter = useAppStore((s) => s.setStorageAdapter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500">Configure OCR engine, storage, and event preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ScanText size={20} /> OCR Engine</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {OCR_ENGINE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors',
                ocrEngine === opt.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',
              )}
            >
              <input
                type="radio"
                name="ocr-engine"
                checked={ocrEngine === opt.value}
                onChange={() => setOcrEngine(opt.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {opt.isFree ? (
                    <span className="bib-badge bg-bib-detected text-white">FREE</span>
                  ) : (
                    <span className="bib-badge bg-bib-unverified text-white">PREMIUM</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
        {!OCR_ENGINE_OPTIONS.find((o) => o.value === ocrEngine)?.isFree && (
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <Input
              label="API Key"
              type="password"
              placeholder="Enter your API key"
            />
            <Button className="mt-2" size="sm"><KeyRound size={14} /> Save Key</Button>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HardDrive size={20} /> Storage Adapter</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STORAGE_ADAPTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStorageAdapter(opt.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-md border p-4 transition-colors',
                storageAdapter === opt.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',
              )}
            >
              <Database size={24} className="text-gray-500" />
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
        {storageAdapter === 'gdrive' && (
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="mb-2 text-sm text-gray-500"><Cloud size={14} className="inline" /> Google Drive Configuration</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Client ID" placeholder="Google OAuth Client ID" />
              <Input label="API Key" placeholder="Google Drive API Key" />
            </div>
            <Button className="mt-2" size="sm">Connect Google Drive</Button>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon size={20} /> Watermark & Export</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <Input label="Event/Sponsor Logo Path" placeholder="/assets/logo-event.png" />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="rounded" />
              Auto-watermark on export
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="rounded" />
              Bulk ZIP download
            </label>
          </div>
          <Button size="sm">Save Settings</Button>
        </div>
      </Card>
    </div>
  )
}
