import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Square, RotateCcw } from 'lucide-react'
import { formatSeconds, buildTimerSteps, ZONE_LABELS, getSpeedRange, ZONE_BAR } from '@/lib/utils'

const RADIUS = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

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
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, stepIdx, steps])

  const progress = currentStep ? timeLeft / currentStep.duration_sec : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const zoneColor = currentStep ? (ZONE_BAR[currentStep.zone] || '#4ade80') : '#4ade80'

  // Build segment bar visualization
  const barSteps = steps.slice(0, 20) // max 20 bars for display

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

      {/* Timer circle */}
      <div className="card flex flex-col items-center gap-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#1e2d42" strokeWidth="7" />
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
      </div>

      {/* Segment visualization */}
      <div className="card">
        <div className="flex items-end gap-0.5 h-10 mb-2">
          {barSteps.map((step, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-opacity"
              style={{
                background: i === stepIdx && running ? ZONE_BAR[step.zone] : ZONE_BAR[step.zone] + (i < stepIdx ? 'ff' : '66'),
                height: step.zone === 'forte' ? '100%' : step.zone === 'moderado' ? '70%' : '40%',
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
