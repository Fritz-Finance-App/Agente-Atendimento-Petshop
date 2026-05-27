import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, CheckCircle2, CalendarDays } from 'lucide-react'

const colorMap = {
  green: {
    gradient: 'from-emerald-50/60 to-teal-50/20 dark:from-emerald-950/20 dark:to-teal-950/5',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100/80 dark:border-emerald-900/30',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: DollarSign
  },
  blue: {
    gradient: 'from-indigo-50/50 to-blue-50/20 dark:from-indigo-950/20 dark:to-blue-950/5',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-100/80 dark:border-indigo-900/30',
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    icon: CheckCircle2
  },
  yellow: {
    gradient: 'from-amber-50/50 to-orange-50/20 dark:from-amber-950/20 dark:to-orange-950/5',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100/80 dark:border-amber-900/30',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    icon: CalendarDays
  },
}

interface MetricCardProps {
  title: string
  value: string
  description: string
  color: keyof typeof colorMap
}

export default function MetricCard({ title, value, description, color }: MetricCardProps) {
  const c = colorMap[color]
  const Icon = c.icon

  return (
    <Card className={`relative overflow-hidden bg-white dark:bg-slate-900 bg-gradient-to-br ${c.gradient} border ${c.border} shadow-[0_2px_12px_rgba(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] hover:-translate-y-0.5 transition-all duration-300 rounded-2xl`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 tracking-wider uppercase block truncate">{title}</span>
            <span className={`text-3xl font-black tracking-tight ${c.text} block truncate`}>{value}</span>
            <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium block truncate">{description}</span>
          </div>
          <div className={`p-3 rounded-xl shrink-0 ${c.iconBg} shadow-inner`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
