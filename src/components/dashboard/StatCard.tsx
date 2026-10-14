import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  sublabel?: string
}

export function StatCard({ label, value, icon: Icon, color = 'text-primary-600', sublabel }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
        <Icon className={cn(color)} size={20} />
      </CardHeader>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        {sublabel && <p className="mt-1 text-xs text-gray-500">{sublabel}</p>}
      </div>
    </Card>
  )
}
