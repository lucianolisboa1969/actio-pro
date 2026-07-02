import { formatDate, formatPace, formatDuration } from '@/lib/utils'
import { MapPin, Clock, Zap } from 'lucide-react'

export default function RecentRuns({ logs }) {
  const runs = (logs || [])
    .filter(l => l.distance_km > 0)
    .slice(0, 5)

  if (!runs.length) return (
    <div className="card text-center py-6 text-muted text-sm">
      Nenhuma corrida registrada ainda.
    </div>
  )

  return (
    <div className="space-y-2">
      {runs.map(run => {
        const pace = run.time_minutes && run.distance_km ? run.time_minutes / run.distance_km : 0
        return (
          <div key={run.id} className="card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-white text-sm">{run.exercises?.name || 'Corrida'}</p>
                <p className="text-xs text-muted">{formatDate(run.date)}</p>
              </div>
              {run.rpe && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                  RPE {run.rpe}/10
                </span>
              )}
            </div>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted">
                <MapPin size={12} /> {run.distance_km} km
              </span>
              {run.time_minutes && (
                <span className="flex items-center gap-1 text-muted">
                  <Clock size={12} /> {formatDuration(run.time_minutes)}
                </span>
              )}
              {pace > 0 && (
                <span className="flex items-center gap-1 text-primary font-medium">
                  <Zap size={12} /> {formatPace(pace)} /km
                </span>
              )}
            </div>
            {run.notes && (
              <p className="text-xs text-muted mt-1.5 italic">"{run.notes}"</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
