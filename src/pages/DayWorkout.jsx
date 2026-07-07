import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, MapPin, Pencil } from 'lucide-react'
import Layout from '@/components/Layout'
import Modal from '@/components/ui/Modal'
import RestTimer from '@/components/workout/RestTimer'
import RunningTimer from '@/components/running/RunningTimer'
import { TrainingPlan, Exercise, WorkoutLog } from '@/api/entities'
import { RUNNING_TYPE_LABELS, MUSCLE_GROUP_LABELS, formatPace } from '@/lib/utils'

// ââ Running Log Form ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function RunningLogForm({ onSubmit, saving, initialValues = {} }) {
  const [dist, setDist] = useState(initialValues.distance_km?.toString() || '')
  const _iv = initialValues.time_minutes
  const _initMins = _iv ? String(Math.floor(_iv)) : ''
  const _initSecs = _iv ? String(Math.round((_iv - Math.floor(_iv)) * 60)) : ''
  const [timeMins, setTimeMins] = useState(_initMins)
  const [timeSecs, setTimeSecs] = useState(_initSecs)
  const [rpe, setRpe] = useState(initialValues.rpe?.toString() || '')
  const [notes, setNotes] = useState(initialValues.notes || '')

  const distNum = Number(dist)
  const timeNum = (Number(timeMins) || 0) + (Number(timeSecs) || 0) / 60
  const pace = distNum > 0 && timeNum > 0 ? formatPace(timeNum / distNum) : null

  function submit(e) {
    e.preventDefault()
    onSubmit({
      distance_km: distNum || null,
      time_minutes: timeNum || null,
      rpe: Number(rpe) || null,
      notes: notes || null,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted mb-1 block">DistÃ¢ncia (km)</label>
          <input type="number" step="0.1" min="0" value={dist} onChange={e => setDist(e.target.value)}
            placeholder="4.0"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Tempo</label>
          <div className="flex gap-1 items-center">
            <input type="number" min="0" max="999" value={timeMins} onChange={e => setTimeMins(e.target.value)}
              placeholder="26"
              className="w-full bg-card border border-border rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-primary text-center" />
            <span className="text-muted text-xs shrink-0">min</span>
            <input type="number" min="0" max="59" value={timeSecs} onChange={e => setTimeSecs(e.target.value)}
              placeholder="48"
              className="w-full bg-card border border-border rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-primary text-center" />
            <span className="text-muted text-xs shrink-0">seg</span>
          </div>
        </div>
      </div>

      {/* Pace â auto calculated */}
      {pace ? (
        <div className="flex items-center justify-between px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-xs text-muted">Pace calculado</span>
          <span className="text-white font-bold">{pace} <span className="text-muted font-normal text-xs">/km</span></span>
        </div>
      ) : (
        <div className="flex items-center justify-between px-3 py-2.5 bg-surface border border-border rounded-lg">
          <span className="text-xs text-muted">Pace calculado</span>
          <span className="text-muted text-sm">â</span>
        </div>
      )}

      <div>
        <label className="text-xs text-muted mb-1 block">
          RPE (1â10) <span className="text-muted/60">â esforÃ§o percebido: 1=fÃ¡cil, 10=mÃ¡ximo</span>
        </label>
        <input type="number" min="1" max="10" value={rpe} onChange={e => setRpe(e.target.value)}
          placeholder="5"
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
      </div>

      <div>
        <label className="text-xs text-muted mb-1 block">Notas (opcional)</label>
        <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Como foi o treino?"
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none" />
      </div>

      <button type="submit" disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary-dim transition-colors disabled:opacity-50">
        {saving ? 'Salvando...' : 'Registrar corrida'}
      </button>
    </form>
  )
}

// ââ Strength Exercise Card ââââââââââââââââââââââââââââââââââââââââââââââââââââ
function StrengthCard({ exercise, log, onSetDone, onMarkDone, onRedo, currentSetProgress = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const done = log?.completed
  const setsCompleted = currentSetProgress
  const totalSets = exercise.sets || 3

  return (
    <div className={`card transition-all ${done ? 'border-primary/30 bg-primary/5' : ''}`}>
      <div className="flex items-start gap-3">
        {exercise.image_url && (
          <img src={exercise.image_url} alt={exercise.name}
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-card" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-medium text-sm ${done ? 'line-through text-muted' : 'text-white'}`}>
              {exercise.name}
            </p>
            {done
              ? <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
              : <Circle size={18} className="text-muted flex-shrink-0 mt-0.5" />
            }
          </div>
          <p className="text-xs text-muted mt-0.5">
            {totalSets} sÃ©ries Â· {exercise.reps} reps Â· {exercise.rest_seconds}s descanso
            {exercise.weight > 0 ? ` Â· ${exercise.weight}kg` : ''}
          </p>
          {exercise.muscle_group && (
            <span className="text-xs bg-surface border border-border text-muted rounded px-1.5 py-0.5 mt-1 inline-block">
              {MUSCLE_GROUP_LABELS[exercise.muscle_group] || exercise.muscle_group}
            </span>
          )}
        </div>
      </div>

      {/* Completed: show redo button */}
      {done && (
        <div className="mt-2 pt-2 border-t border-border/30 flex justify-end">
          <button
            onClick={onRedo}
            className="text-xs text-muted hover:text-white transition-colors flex items-center gap-1"
          >
            <Pencil size={12} /> Editar / Refazer
          </button>
        </div>
      )}

      {/* Sets tracker */}
      {!done && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">SÃ©ries ({setsCompleted}/{totalSets})</span>
            <button onClick={() => setExpanded(e => !e)} className="text-muted hover:text-white transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalSets }, (_, i) => (
              <button
                key={i}
                onClick={() => onSetDone(exercise, i + 1, totalSets)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  i < setsCompleted
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : i === setsCompleted
                    ? 'bg-surface border-primary/60 text-white hover:bg-primary/10'
                    : 'bg-surface border-border text-muted'
                }`}
              >
                {i < setsCompleted ? 'â' : `${i + 1}`}
              </button>
            ))}
          </div>

          {setsCompleted >= totalSets && (
            <button
              onClick={onMarkDone}
              className="mt-2 w-full py-2 rounded-lg bg-primary text-black font-semibold text-xs hover:bg-primary-dim transition-colors"
            >
              Concluir exercÃ­cio
            </button>
          )}

          {expanded && exercise.notes && (
            <div className="mt-2 p-2 bg-card rounded-lg">
              <p className="text-xs text-muted italic">{exercise.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ââ Main Page âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function DayWorkout() {
  const { planId, dia } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const dayNumber = Number(dia)

  const [restTimer, setRestTimer] = useState(null)
  const [logRunModal, setLogRunModal] = useState(null)   // exercise being logged
  const [editInitialValues, setEditInitialValues] = useState({}) // pre-fill values for edit
  const [setProgress, setSetProgress] = useState({})

  const { data: plan } = useQuery({
    queryKey: ['training_plan', planId],
    queryFn: () => TrainingPlan.get(planId),
  })

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises_day', planId, dayNumber],
    queryFn: () => Exercise.listByDay(planId, dayNumber),
  })

  const { data: todayLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ['today_logs', planId, dayNumber],
    queryFn: () => WorkoutLog.getTodayLogs(planId, dayNumber),
  })

  const markDone = useMutation({
    mutationFn: ({ exercise, extra }) => WorkoutLog.markExerciseComplete(
      planId, exercise.id, dayNumber, plan?.current_week || 1, extra
    ),
    onSuccess: () => {
      refetchLogs()
      qc.invalidateQueries(['workout_logs', planId])
    },
  })

  const logRun = useMutation({
    mutationFn: ({ exercise, runData }) => WorkoutLog.markExerciseComplete(
      planId, exercise.id, dayNumber, plan?.current_week || 1, runData
    ),
    onSuccess: () => {
      refetchLogs()
      qc.invalidateQueries(['workout_logs', planId])
      qc.invalidateQueries(['run_logs', planId])
      setLogRunModal(null)
      setEditInitialValues({})
    },
  })

  const deleteLog = useMutation({
    mutationFn: (logId) => WorkoutLog.delete(logId),
    onSuccess: () => {
      refetchLogs()
      qc.invalidateQueries(['workout_logs', planId])
    },
  })

  function getLog(exerciseId) {
    return todayLogs.find(l => l.exercise_id === exerciseId)
  }

  function handleSetDone(exercise, setNum, totalSets) {
    const current = setProgress[exercise.id] || 0
    if (setNum !== current + 1) return
    const next = setNum
    setSetProgress(p => ({ ...p, [exercise.id]: next }))
    if (setNum < totalSets) {
      setRestTimer({ exercise, currentSet: setNum, totalSets })
    }
  }

  function handleMarkDone(exercise) {
    const setsCompleted = setProgress[exercise.id] || exercise.sets
    markDone.mutate({ exercise, extra: { sets_completed: setsCompleted, completed: true } })
    setSetProgress(p => { const n = { ...p }; delete n[exercise.id]; return n })
  }

  function handleRedoStrength(exercise) {
    const log = getLog(exercise.id)
    if (log) deleteLog.mutate(log.id)
    setSetProgress(p => ({ ...p, [exercise.id]: 0 }))
  }

  function handleEditRun(exercise) {
    const log = getLog(exercise.id)
    setEditInitialValues(log || {})
    setLogRunModal(exercise)
  }

  const strengthExercises = exercises.filter(e => e.exercise_type === 'musculacao')
  const runningExercises = exercises.filter(e => e.exercise_type === 'corrida')
  const completedCount = todayLogs.filter(l => l.completed).length
  const isRunDay = runningExercises.length > 0

  if (!plan) return (
    <Layout title={`Dia ${dayNumber}`} back={`/plano/${planId}`}>
      <div className="py-12 text-center text-muted">Carregando...</div>
    </Layout>
  )

  return (
    <Layout title={`Dia ${dayNumber} â Treino`} back={`/plano/${planId}`}>
      <div className="pt-4 space-y-4">
        {/* Header status */}
        <div className="flex items-center justify-between">
          <p className="text-muted text-sm">
            {completedCount}/{exercises.length} concluÃ­dos
          </p>
          {completedCount === exercises.length && exercises.length > 0 && (
            <span className="text-xs bg-primary/20 text-primary border border-primary/30 rounded-full px-2.5 py-1">
              Treino completo! ð
            </span>
          )}
        </div>

        {/* Running section */}
        {isRunDay && runningExercises.map(ex => (
          <div key={ex.id} className="space-y-3">
            <div className="card border-blue-500/20 bg-blue-500/5">
              <p className="text-muted text-xs mb-0.5">Corrida</p>
              <p className="font-semibold text-white">{ex.name}</p>
              <p className="text-xs text-muted">{RUNNING_TYPE_LABELS[ex.running_type]}</p>
            </div>
            <RunningTimer exercise={ex} plan={plan} />

            {/* Log / edit run button */}
            {!getLog(ex.id) ? (
              <button
                onClick={() => { setEditInitialValues({}); setLogRunModal(ex) }}
                className="w-full py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary-dim transition-colors flex items-center justify-center gap-2"
              >
                <MapPin size={16} /> Registrar corrida
              </button>
            ) : (
              <div className="card border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span className="text-primary text-sm font-medium">Corrida registrada</span>
                  </div>
                  <button
                    onClick={() => handleEditRun(ex)}
                    className="text-muted hover:text-white transition-colors flex items-center gap-1 text-xs"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                </div>
                {getLog(ex.id)?.distance_km && (() => {
                  const log = getLog(ex.id)
                  const pace = log.distance_km > 0 && log.time_minutes > 0
                    ? formatPace(log.time_minutes / log.distance_km)
                    : null
                  return (
                    <p className="text-muted text-xs mt-1">
                      {log.distance_km} km Â· {log.time_minutes} min
                      {pace ? ` Â· ${pace}/km` : ''}
                      {log.rpe ? ` Â· RPE ${log.rpe}/10` : ''}
                    </p>
                  )
                })()}
              </div>
            )}
          </div>
        ))}

        {/* Strength exercises */}
        {strengthExercises.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-white text-sm">MusculaÃ§Ã£o</h2>
            {strengthExercises.map(ex => (
              <StrengthCard
                key={ex.id}
                exercise={ex}
                log={getLog(ex.id)}
                onSetDone={(exercise, setNum, totalSets) => handleSetDone(exercise, setNum, totalSets)}
                onMarkDone={() => handleMarkDone(ex)}
                onRedo={() => handleRedoStrength(ex)}
                currentSetProgress={setProgress[ex.id] || 0}
              />
            ))}
          </div>
        )}

        {exercises.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-muted">Nenhum exercÃ­cio neste dia.</p>
          </div>
        )}
      </div>

      {/* Rest Timer overlay */}
      <RestTimer
        open={!!restTimer}
        restSeconds={restTimer?.exercise?.rest_seconds || 60}
        exerciseName={restTimer?.exercise?.name || ''}
        currentSet={restTimer?.currentSet || 1}
        totalSets={restTimer?.totalSets || 1}
        onDone={() => setRestTimer(null)}
        onSkip={() => setRestTimer(null)}
      />

      {/* Running log modal */}
      <Modal
        open={!!logRunModal}
        onClose={() => { setLogRunModal(null); setEditInitialValues({}) }}
        title={`Registrar â ${logRunModal?.name || 'Corrida'}`}
      >
        {logRunModal && (
          <RunningLogForm
            key={logRunModal.id + JSON.stringify(editInitialValues)}
            initialValues={editInitialValues}
            onSubmit={runData => logRun.mutate({ exercise: logRunModal, runData })}
            saving={logRun.isPending}
          />
        )}
      </Modal>
    </Layout>
  )
}
