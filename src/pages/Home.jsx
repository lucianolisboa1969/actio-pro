import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Flame, TrendingUp, Dumbbell, Calendar, ChevronRight, Trophy, Activity, Zap, CheckCircle2 } from 'lucide-react'
import Layout from '@/components/Layout'
import RunningStats from '@/components/running/RunningStats'
import RunningInsights from '@/components/running/RunningInsights'
import RecentRuns from '@/components/running/RecentRuns'
import { TrainingPlan, Exercise, WorkoutLog } from '@/api/entities'
import { GOAL_LABELS, RUNNING_TYPE_LABELS, formatDate } from '@/lib/utils'

export default function Home() {
  const navigate = useNavigate()
  const [expandPlan, setExpandPlan] = useState(false)

  const { data: plans = [] } = useQuery({
    queryKey: ['training_plans'],
    queryFn: () => TrainingPlan.list(),
  })

  const activePlan = plans.find(p => p.is_active) || plans[0]

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises', activePlan?.id],
    queryFn: () => Exercise.listByPlan(activePlan.id),
    enabled: !!activePlan?.id,
  })

  const { data: logs = [] } = useQuery({
    queryKey: ['workout_logs', activePlan?.id],
    queryFn: () => WorkoutLog.listByPlan(activePlan.id),
    enabled: !!activePlan?.id,
  })

  const { data: runLogs = [] } = useQuery({
    queryKey: ['run_logs', activePlan?.id],
    queryFn: () => WorkoutLog.listRunning(activePlan.id),
    enabled: !!activePlan?.id,
  })

  // Stats
  const today = new Date().toISOString().split('T')[0]
  const todayLogs = logs.filter(l => l.date === today && l.completed)
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekLogs = logs.filter(l => new Date(l.date) >= weekStart && l.completed)
  const totalExercises = exercises.length
  const daysPerWeek = activePlan?.days_per_week || 0

  const currentDay = activePlan?.current_day || 1
  const todayExercises = exercises.filter(e => e.day_number === currentDay)
  const todayDone = todayLogs.filter(l => todayExercises.some(e => e.id === l.exercise_id)).length

  // Days grouped
  const dayNumbers = [...new Set(exercises.map(e => e.day_number))].sort((a, b) => a - b)

  // Next day after current
  const nextDay = dayNumbers.find(d => d > currentDay) || dayNumbers[0]
  const nextDayExercises = nextDay && nextDay !== currentDay
    ? exercises.filter(e => e.day_number === nextDay)
    : []
  const allTodayDone = todayExercises.length > 0 && todayDone >= todayExercises.length

  const [runSection, setRunSection] = useState('stats') // 'stats' | 'insights' | 'history'

  if (!activePlan) {
    return (
      <Layout title="Meus Treinos">
        <div className="pt-6 text-center">
          <Trophy size={40} className="text-muted mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Nenhum plano encontrado</p>
          <p className="text-muted text-sm">Seu plano de treino aparecerá aqui.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Meus Treinos">
      <div className="pt-4 space-y-4">
        {/* Sub-header */}
        <p className="text-muted text-sm">Gerencie seus planos e exercícios</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card-red border border-red-900/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted uppercase tracking-wide">Treino Hoje</span>
              <Flame size={16} className="text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white">{todayDone}</p>
            <p className="text-muted text-xs mt-0.5">de {todayExercises.length} exercícios</p>
          </div>

          <div className="bg-card-green border border-green-900/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted uppercase tracking-wide">Esta Semana</span>
              <TrendingUp size={16} className="text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{weekLogs.length}</p>
            <p className="text-muted text-xs mt-0.5">de {totalExercises} exercícios</p>
          </div>

          <div className="bg-card-teal border border-teal-900/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted uppercase tracking-wide">Total Exercícios</span>
              <Dumbbell size={16} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalExercises}</p>
            <p className="text-muted text-xs mt-0.5">no plano atual</p>
          </div>

          <div className="bg-card-purple border border-purple-900/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted uppercase tracking-wide">Dias de Treino</span>
              <Calendar size={16} className="text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{daysPerWeek}</p>
            <p className="text-muted text-xs mt-0.5">por semana</p>
          </div>
        </div>

        {/* Active plan card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Trophy size={18} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-white">{activePlan.name}</span>
            </div>
            <button
              onClick={() => navigate(`/plano/${activePlan.id}`)}
              className="text-xs bg-surface border border-border rounded-lg px-3 py-1.5 text-muted hover:text-white transition-colors flex items-center gap-1"
            >
              Ver Detalhes <ChevronRight size={12} />
            </button>
          </div>

          <p className={`text-muted text-sm ${expandPlan ? '' : 'line-clamp-3'}`}>
            {activePlan.description}
          </p>
          <button onClick={() => setExpandPlan(e => !e)} className="text-xs text-primary mt-1 hover:underline">
            {expandPlan ? 'Ver menos' : 'Ver mais'}
          </button>

          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1">
              {GOAL_LABELS[activePlan.goal] || activePlan.goal}
            </span>
            <span className="text-xs bg-surface border border-border rounded-full px-2.5 py-1 text-muted">
              {activePlan.days_per_week}x por semana
            </span>
            <span className="text-xs bg-surface border border-border rounded-full px-2.5 py-1 text-muted">
              Ciclo {activePlan.current_week || 1}/4
            </span>
          </div>
        </div>

        {/* Today's workout CTA */}
        {todayExercises.length > 0 && (
          allTodayDone ? (
            <div className="card border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={17} className="text-primary" />
                <p className="text-primary font-semibold text-sm">Dia {currentDay} completo! 🎉</p>
              </div>
              {nextDayExercises.length > 0 && (
                <div className="mt-1 pt-2 border-t border-border/40">
                  <p className="text-muted text-xs">Próximo — Dia {nextDay}</p>
                  <p className="text-white text-sm font-medium mt-0.5">
                    {nextDayExercises.filter(e => e.exercise_type === 'corrida').length > 0
                      ? `Corrida — ${RUNNING_TYPE_LABELS[nextDayExercises.find(e => e.exercise_type === 'corrida')?.running_type]}`
                      : `Musculação — ${nextDayExercises.length} exercícios`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-xs">Treino de Hoje — Dia {currentDay}</p>
                  <p className="text-white font-medium text-sm mt-0.5">
                    {todayExercises.filter(e => e.exercise_type === 'corrida').length > 0
                      ? `Corrida — ${RUNNING_TYPE_LABELS[todayExercises.find(e => e.exercise_type === 'corrida')?.running_type]}`
                      : `Musculação — ${todayExercises.length} exercícios`}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/treino/${activePlan.id}/${currentDay}`)}
                  className="bg-primary text-black font-semibold px-4 py-2 rounded-xl text-sm hover:bg-primary-dim transition-colors flex items-center gap-1"
                >
                  {todayDone > 0 ? 'Continuar' : 'Iniciar Treino'} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )
        )}

        {/* Running section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-primary" />
            <h2 className="font-semibold text-white text-sm">Evolução Corrida</h2>
          </div>

          {runLogs.length === 0 ? (
            <div className="card text-center py-6">
              <Zap size={24} className="text-muted mx-auto mb-2" />
              <p className="text-muted text-sm">Nenhuma corrida registrada ainda.</p>
            </div>
          ) : (
            <>
              <RunningStats logs={runLogs} />

              <div className="flex gap-2 mt-4 mb-3">
                {['stats', 'insights', 'history'].map(s => (
                  <button
                    key={s}
                    onClick={() => setRunSection(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      runSection === s
                        ? 'bg-primary text-black border-primary'
                        : 'bg-surface border-border text-muted hover:text-white'
                    }`}
                  >
                    {s === 'stats' ? 'Fase' : s === 'insights' ? 'Insights' : 'Histórico'}
                  </button>
                ))}
              </div>

              {runSection === 'insights' && <RunningInsights logs={runLogs} plan={activePlan} />}
              {runSection === 'history' && <RecentRuns logs={runLogs} />}
              {runSection === 'stats' && (
                <div className="space-y-3">
                  {[
                    { label: 'Distância da Fase', val: `${runLogs.reduce((s,l) => s + Number(l.distance_km||0), 0).toFixed(1)} km`, sub: `${runLogs.filter(l=>l.distance_km>0).length} corrida(s)` },
                    { label: 'Maior Distância', val: `${Math.max(...runLogs.filter(l=>l.distance_km>0).map(l=>Number(l.distance_km)), 0)} km`, sub: 'na fase atual' },
                  ].map(s => (
                    <div key={s.label} className="card">
                      <p className="text-muted text-xs">{s.label}</p>
                      <p className="text-2xl font-bold text-white mt-0.5">{s.val}</p>
                      <p className="text-muted text-xs">{s.sub}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
