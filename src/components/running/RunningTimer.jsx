import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Square, RotateCcw } from 'lucide-react'
import { formatSeconds, buildTimerSteps, ZONE_LABELS, getSpeedRange, ZONE_BAR } from '@/lib/utils'

// Inner ring (current step progress)
const RADIUS = 43
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Outer ring (total workout progress)
const OUTER_RADIUS = 48
const OUTER_CIRCUMFERENCE = 2 * Math.PI * OUTER_RADIUS

function beep(freq = 660) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq; osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(); osc.stop(ctx.currentTime + 0.3)
  } catch (_) {}
}

const SECTION_LABELS = { warmup: 'Aquecimento', repeats: 'Repetições', cooldown: 'Desaceleração' }
const SECTION_COLORS = { warmup: '#f97316', repeats: '#4ade80', cooldown: '#60a5fa' }

export default function RunningTimer({ exercise, plan }) {
  const cycles = exercise?.run_cycles || []
  const availableCycles = cycles.map(c => c.cycle_number)
  const [cycleNum, setCycleNum] = useState(availableCycles[0] || 1)

  const steps = buildTimerSteps(cycles, cycleNum)

  const [stepIdx, setStepIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(steps[0]?.duration_sec || 0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef(null)

  const currentStep = steps[stepIdx]

  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    setStepIdx(0)
    setTimeLeft(steps[0]?.duration_sec || 0)
    setRunning(false)
    setFinished(false)
  }, [steps])

  useEffect(() => { reset() }, [cycleNum])

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          beep()
          const next = stepIdx + 1
          if (next >= steps.length) {
            setFinished(true)
            setRunning(false)
            return 0
          }
          setStepIdx(next)
          setTimeLeft(steps[next].duration_sec)
          setTimeout(() => setRunning(true), 100)
          return 0
        }
        const next = prev - 1
        if (next <= 5) {
          beep()
          setTimeout(beep, 500) // second beep at half-second mark
        }
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, stepIdx, steps])

  // Inner ring: current step progress
  const progress = currentStep ? timeLeft / currentStep.duration_sec : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const zoneColor = currentStep ? (ZONE_BAR[currentStep.zone] || '#4ade80') : '#4ade80'

  // Outer ring: total workout progress
  const totalDurationSec = steps.reduce((sum, s) => sum + s.duration_sec, 0)
  const elapsedSec = steps.slice(0, stepIdx).reduce((sum, s) => sum + s.duration_sec, 0)
    + (currentStep ? currentStep.duration_sec - timeLeft : 0)
  const totalProgress = totalDurationSec > 0
    ? (finished ? 1 : elapsedSec / totalDurationSec)
    : 0
  const outerDashOffset = OUTER_CIRCUMFERENCE * (1 - totalProgress)
  const outerColor = currentStep ? SECTION_COLORS[currentStep.section] : '#4ade80'

  // Segment bar
  const barSteps = steps.slice(0, 20)

  if (!steps.length) {
    return (
      <div className="card text-center py-8 text-muted text-sm">
        Nenhum ciclo configurado para este treino.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cycle selector */}
      {availableCycles.length > 0 && (
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(n => {
            const available = availableCycles.includes(n)
            return (
              <button
                key={n}
                onClick={() => available && setCycleNum(n)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  cycleNum === n
                    ? 'bg-primary text-black border-primary'
                    : available
                    ? 'bg-surface border-border text-muted hover:text-white'
                    : 'bg-surface border-border text-border cursor-default'
                }`}
              >
                C{n}
              </button>
            )
          })}
        </div>
      )}

      {/* Timer circles */}
      <div className="card flex flex-col items-center gap-4">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Outer ring track */}
            <circle cx="50" cy="50" r={OUTER_RADIUS} fill="none" stroke="#1e2d42" strokeWidth="3" />
            {/* Outer ring progress — total workout, color by section */}
            <circle
              cx="50" cy="50" r={OUTER_RADIUS}
              fill="none"
              stroke={finished ? '#4ade80' : outerColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={OUTER_CIRCUMFERENCE}
              strokeDashoffset={outerDashOffset}
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s ease' }}
            />
            {/* Inner ring track */}
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#1e2d42" strokeWidth="7" />
            {/* Inner ring progress — current step */}
            <circle
              cx="50" cy="50" r={RADIUS}
              fill="none"
              stroke={zoneColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {finished ? (
              <span className="text-primary text-lg font-bold">Concluído!</span>
            ) : (
              <>
                <span className="text-3xl font-bold text-white tabular-nums">{formatSeconds(timeLeft)}</span>
                {currentStep && (
                  <span className="text-xs text-muted mt-0.5">{SECTION_LABELS[currentStep.section]}</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Zone info */}
        {currentStep && !finished && (
          <div className="text-center">
            <p className="font-semibold" style={{ color: zoneColor }}>
              {ZONE_LABELS[currentStep.zone]}
            </p>
            <p className="text-muted text-sm">{getSpeedRange(currentStep.zone, plan)}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="p-3 rounded-xl bg-card border border-border text-muted hover:text-white transition-colors"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => setRunning(r => !r)}
            disabled={finished}
            className="px-8 py-3 rounded-xl bg-primary text-black font-semibold flex items-center gap-2 hover:bg-primary-dim transition-colors disabled:opacity-40"
          >
            {running ? <Square size={16} /> : <Play size={16} />}
            {running ? 'Parar' : 'Iniciar'}
          </button>
        </div>

        {/* Total progress label */}
        {!finished && totalDurationSec > 0 && (
          <p className="text-xs text-muted">
            Treino: {Math.round(totalProgress * 100)}% · {formatSeconds(Math.max(0, totalDurationSec - elapsedSec))} restantes
          </p>
        )}
      </div>

      {/* Segment visualization */}
      <div className="card">
        <div className="flex items-end gap-0.5 h-10 mb-2">
          {barSteps.map((step, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-opacity"
              style={{
                background: ZONE_BAR[step.zone] + (i < stepIdx ? 'ff' : '66'),
                height: step.zone === 'forte' ? '100%' : step.zone === 'moderado' ? '70%' : '40%',
                outline: i === stepIdx && running ? `2px solid ${ZONE_BAR[step.zone]}` : 'none',
              }}
            />
          ))}
        </div>
        <div className="flex gap-4 text-xs text-muted">
          {Object.entries(SECTION_LABELS).map(([key, label]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: SECTION_COLORS[key] }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step info */}
      {currentStep && !finished && (
        <p className="text-xs text-muted text-center">
          Bloco {stepIdx + 1} de {steps.length}
        </p>
      )}
    </div>
  )
}
