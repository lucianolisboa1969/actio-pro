import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SkipForward } from 'lucide-react'
import { formatSeconds } from '@/lib/utils'

const RADIUS = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 880
    oscillator.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.4)
  } catch (_) {}
}

export default function RestTimer({ open, restSeconds, exerciseName, currentSet, totalSets, onDone, onSkip }) {
  const [timeLeft, setTimeLeft] = useState(restSeconds)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)

  const handleDone = useCallback(() => {
    clearInterval(intervalRef.current)
    beep()
    setTimeout(onDone, 300)
  }, [onDone])

  useEffect(() => {
    if (!open) return
    setTimeLeft(restSeconds)
    setRunning(true)
  }, [open, restSeconds])

  useEffect(() => {
    if (!running || !open) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          beep()
          setTimeout(onDone, 300)
          return 0
        }
        const next = prev - 1
        if (next <= 5) beep()
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, open, onDone])

  const progress = restSeconds > 0 ? (timeLeft / restSeconds) : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const pct = Math.round(progress * 100)

  const zoneColor = timeLeft > restSeconds * 0.4 ? '#4ade80' : timeLeft > restSeconds * 0.2 ? '#f97316' : '#ef4444'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 flex flex-col items-center gap-5"
            >
              <div className="text-center">
                <p className="text-muted text-sm">Descanso</p>
                <p className="text-white font-semibold mt-0.5">{exerciseName}</p>
                {totalSets > 1 && (
                  <p className="text-muted text-xs mt-0.5">
                    Série {currentSet} de {totalSets} concluída
                  </p>
                )}
              </div>

              {/* Circular timer */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#1e2d42" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r={RADIUS}
                    fill="none"
                    stroke={zoneColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white tabular-nums">{formatSeconds(timeLeft)}</span>
                  <span className="text-xs text-muted">restante</span>
                </div>
              </div>

              {/* Pause/Resume */}
              <button
                onClick={() => setRunning(r => !r)}
                className="text-sm text-muted hover:text-white transition-colors"
              >
                {running ? 'Pausar' : 'Continuar'}
              </button>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={onSkip}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-muted hover:text-white transition-colors text-sm"
                >
                  <SkipForward size={16} />
                  Pular
                </button>
                <button
                  onClick={handleDone}
                  className="flex-1 py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary-dim transition-colors"
                >
                  Próxima série
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
