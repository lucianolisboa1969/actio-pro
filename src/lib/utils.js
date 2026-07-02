import { format, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd 'de' MMM", { locale: ptBR })
}

export function formatDateTime(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatPace(paceMinPerKm) {
  if (!paceMinPerKm || paceMinPerKm === 0) return '--:--'
  const min = Math.floor(paceMinPerKm)
  const sec = Math.round((paceMinPerKm - min) * 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function formatDuration(minutes) {
  if (!minutes) return '0min'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}min`
  return `${h}h${m > 0 ? `${m}min` : ''}`
}

export function formatSeconds(totalSeconds) {
  const min = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export function calcPace(distanceKm, timeMinutes) {
  if (!distanceKm || !timeMinutes || distanceKm === 0) return 0
  return timeMinutes / distanceKm
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const ZONE_LABELS = {
  leve: 'Leve',
  moderado: 'Moderado',
  forte: 'Forte',
}

export const ZONE_COLORS = {
  leve: 'text-zone-leve',
  moderado: 'text-zone-moderado',
  forte: 'text-zone-forte',
}

export const ZONE_BG = {
  leve: 'bg-zone-leve/20 border-zone-leve/40',
  moderado: 'bg-zone-moderado/20 border-zone-moderado/40',
  forte: 'bg-zone-forte/20 border-zone-forte/40',
}

export const ZONE_BAR = {
  leve: '#4ade80',
  moderado: '#f97316',
  forte: '#ef4444',
}

export const GOAL_LABELS = {
  hipertrofia: 'Hipertrofia',
  forca: 'Força',
  resistencia: 'Resistência',
  emagrecimento: 'Emagrecimento',
  condicionamento: 'Condicionamento',
}

export const MUSCLE_GROUP_LABELS = {
  superiores: 'Superiores',
  inferiores: 'Inferiores',
  pernas_gluteos: 'Pernas e Glúteos',
  core: 'Core',
  costas: 'Costas',
  peito: 'Peito',
  ombros: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
}

export const RUNNING_TYPE_LABELS = {
  intervalos: 'Intervalos',
  ritmo: 'Ritmo',
  longao: 'Longão',
}

export function getSpeedRange(zone, plan) {
  if (!plan) return ''
  const ranges = {
    leve: `${plan.easy_min_kmh}–${plan.easy_max_kmh} km/h`,
    moderado: `${plan.moderate_min_kmh}–${plan.moderate_max_kmh} km/h`,
    forte: `${plan.hard_min_kmh}–${plan.hard_max_kmh} km/h`,
  }
  return ranges[zone] || ''
}

// Build a flat list of timer steps from run_cycles for a given cycle number
export function buildTimerSteps(runCycles, cycleNumber = 1) {
  const cycle = runCycles?.find(c => c.cycle_number === cycleNumber) || runCycles?.[0]
  if (!cycle?.run_blocks?.length) return []

  const steps = []
  cycle.run_blocks.forEach(segment => {
    const repeats = segment.repeat || 1
    for (let r = 0; r < repeats; r++) {
      segment.blocks.forEach(block => {
        steps.push({
          section: segment.section,
          zone: block.zone,
          duration_sec: Math.round(block.duration_min * 60),
          repeatIndex: r,
          totalRepeats: repeats,
        })
      })
    }
  })
  return steps
}
