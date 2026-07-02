import { formatPace, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, Award, Calendar, Target } from 'lucide-react'

export default function RunningInsights({ logs, plan }) {
  const runs = (logs || []).filter(l => l.distance_km > 0 && l.time_minutes > 0)
  if (!runs.length) return null

  const sorted = [...runs].sort((a, b) => new Date(a.date) - new Date(b.date))
  const latest = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]

  const latestPace = latest ? latest.time_minutes / latest.distance_km : 0
  const prevPace = prev ? prev.time_minutes / prev.distance_km : 0
  const paceChange = prev ? ((prevPace - latestPace) / prevPace) * 100 : 0 // positive = improved

  const bestPace = Math.min(...runs.map(l => l.time_minutes / l.distance_km))
  const maxDist = Math.max(...runs.map(l => Number(l.distance_km)))
  const totalKm = runs.reduce((s, l) => s + Number(l.distance_km), 0)

  // Consistency: runs in last 4 weeks
  const fourWeeksAgo = new Date()
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
  const recentRuns = runs.filter(l => new Date(l.date) >= fourWeeksAgo)

  const insights = [
    {
      label: 'Evolução do Pace',
      value: paceChange !== 0 ? `${Math.abs(paceChange).toFixed(1)}%` : '0.0%',
      sub: prev ? (paceChange > 0 ? 'Pace melhorou!' : paceChange < 0 ? 'Pace piorou' : 'Estável') : 'Continue treinando',
      icon: paceChange >= 0 ? TrendingUp : TrendingDown,
      color: paceChange >= 0 ? 'text-primary' : 'text-red-400',
    },
    {
      label: 'Melhor Pace',
      value: formatPace(bestPace),
      sub: `em ${formatDate(runs.find(l => l.time_minutes / l.distance_km === bestPace)?.date)}`,
      icon: Award,
      color: 'text-primary',
    },
    {
      label: 'Distância Total',
      value: `${totalKm.toFixed(1)} km`,
      sub: `em ${runs.length} corridas`,
      icon: Target,
      color: 'text-blue-400',
    },
    {
      label: 'Consistência (4 sem)',
      value: `${recentRuns.length} corridas`,
      sub: recentRuns.length >= 3 ? 'Ótima consistência!' : 'Tente correr mais',
      icon: Calendar,
      color: recentRuns.length >= 3 ? 'text-primary' : 'text-muted',
    },
  ]

  const bestRun = runs.find(l => Number(l.distance_km) === maxDist)

  return (
    <div className="space-y-3">
      {insights.map(ins => (
        <div key={ins.label} className="card flex items-center gap-4">
          <div className="flex-shrink-0">
            <ins.icon size={20} className={ins.color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted">{ins.label}</p>
            <p className={`text-xl font-bold ${ins.color}`}>{ins.value}</p>
            <p className="text-xs text-muted">{ins.sub}</p>
          </div>
        </div>
      ))}

      {bestRun && (
        <div className="card">
          <p className="text-xs text-muted mb-1">Corrida Mais Longa</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-blue-400">{maxDist}</p>
              <p className="text-muted text-sm">km</p>
              <p className="text-muted text-xs mt-1">em {formatDate(bestRun.date)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">RPE Médio:</p>
              <p className="text-white font-semibold">{bestRun.rpe || '--'}/10</p>
            </div>
          </div>
          {bestRun.notes && (
            <p className="text-xs text-muted mt-2 italic">"{bestRun.notes}"</p>
          )}
        </div>
      )}

      {plan && (
        <div className="card bg-orange-500/10 border-orange-500/20">
          <p className="text-xs text-orange-400 font-medium">Zonas de velocidade (Fase atual)</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-zone-leve">Leve: {plan.easy_min_kmh}–{plan.easy_max_kmh} km/h</span>
            <span className="text-zone-moderado">Mod: {plan.moderate_min_kmh}–{plan.moderate_max_kmh}</span>
            <span className="text-zone-forte">Forte: {plan.hard_min_kmh}–{plan.hard_max_kmh}</span>
          </div>
        </div>
      )}
    </div>
  )
}
