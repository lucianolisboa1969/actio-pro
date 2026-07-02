import { Activity, Zap, TrendingUp, CheckCircle } from 'lucide-react'
import { formatPace } from '@/lib/utils'

export default function RunningStats({ logs }) {
  const runs = logs || []
  const totalKm = runs.reduce((s, l) => s + (Number(l.distance_km) || 0), 0)
  const completed = runs.filter(l => l.completed).length

  const paces = runs
    .filter(l => l.distance_km > 0 && l.time_minutes > 0)
    .map(l => l.time_minutes / l.distance_km)

  const bestPace = paces.length ? Math.min(...paces) : 0
  const avgPace = paces.length ? paces.reduce((a, b) => a + b, 0) / paces.length : 0

  const stats = [
    { label: 'Total KM', value: totalKm.toFixed(1), sub: 'km rodados', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Melhor Pace', value: formatPace(bestPace), sub: '/km', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pace Médio', value: formatPace(avgPace), sub: '/km', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Treinos', value: completed, sub: 'completados', icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(s => (
        <div key={s.label} className="card">
          <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
            <s.icon size={16} className={s.color} />
          </div>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-muted mt-0.5">{s.label}</p>
          <p className="text-xs text-muted">{s.sub}</p>
        </div>
      ))}
    </div>
  )
}
