import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const MUSCLE_GROUPS = [
  { value: 'superiores', label: 'Superiores' },
  { value: 'pernas_gluteos', label: 'Pernas e Glúteos' },
  { value: 'core', label: 'Core' },
  { value: 'costas', label: 'Costas' },
]

const MUSCLES_BY_GROUP = {
  superiores: ['peitoral', 'deltoide_anterior', 'deltoide_medial', 'deltoide_posterior', 'triceps', 'biceps', 'dorsais'],
  pernas_gluteos: ['gluteos', 'isquiotibiais', 'quadriceps', 'panturrilha_gastrocnemio', 'panturrilha_soleo', 'adutores'],
  core: ['transverso', 'obliquos', 'reto_abdominal'],
  costas: ['dorsais', 'trapezio', 'romboides'],
}

const RUNNING_TYPES = [
  { value: 'intervalos', label: 'Intervalos' },
  { value: 'ritmo', label: 'Ritmo' },
  { value: 'longao', label: 'Longão' },
]

const ZONES = ['leve', 'moderado', 'forte']
const SECTIONS = [
  { value: 'warmup', label: 'Aquecimento' },
  { value: 'repeats', label: 'Repetições' },
  { value: 'cooldown', label: 'Desaceleração' },
]

function defaultSegment() {
  return { section: 'warmup', repeat: 1, blocks: [{ zone: 'leve', duration_min: 5 }] }
}

export default function ExerciseForm({ initial, dayNumber, planId, onSave, onCancel, saving }) {
  const isEdit = !!initial?.id
  const [type, setType] = useState(initial?.exercise_type || 'musculacao')
  const [name, setName] = useState(initial?.name || '')
  const [muscleGroup, setMuscleGroup] = useState(initial?.muscle_group || '')
  const [targetMuscle, setTargetMuscle] = useState(initial?.target_muscle || '')
  const [sets, setSets] = useState(initial?.sets ?? 3)
  const [reps, setReps] = useState(initial?.reps ?? 10)
  const [weight, setWeight] = useState(initial?.weight ?? 0)
  const [restSeconds, setRestSeconds] = useState(initial?.rest_seconds ?? 60)
  const [notes, setNotes] = useState(initial?.notes || '')
  const [imageUrl, setImageUrl] = useState(initial?.image_url || '')
  const [runningType, setRunningType] = useState(initial?.running_type || 'intervalos')
  const [segments, setSegments] = useState(() => {
    const cycles = initial?.run_cycles || []
    const cycle = cycles[0]
    return cycle?.run_blocks?.length ? cycle.run_blocks : [defaultSegment()]
  })

  function addSegment() { setSegments(s => [...s, defaultSegment()]) }
  function removeSegment(i) { setSegments(s => s.filter((_, idx) => idx !== i)) }
  function updateSegment(i, field, val) {
    setSegments(s => s.map((seg, idx) => idx === i ? { ...seg, [field]: val } : seg))
  }
  function addBlock(segIdx) {
    setSegments(s => s.map((seg, idx) => idx === segIdx
      ? { ...seg, blocks: [...seg.blocks, { zone: 'leve', duration_min: 1 }] }
      : seg
    ))
  }
  function removeBlock(segIdx, bIdx) {
    setSegments(s => s.map((seg, idx) => idx === segIdx
      ? { ...seg, blocks: seg.blocks.filter((_, bi) => bi !== bIdx) }
      : seg
    ))
  }
  function updateBlock(segIdx, bIdx, field, val) {
    setSegments(s => s.map((seg, idx) => idx === segIdx
      ? { ...seg, blocks: seg.blocks.map((b, bi) => bi === bIdx ? { ...b, [field]: val } : b) }
      : seg
    ))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const base = {
      name,
      exercise_type: type,
      training_plan_id: planId,
      day_number: Number(dayNumber),
      notes,
      image_url: imageUrl,
    }
    if (type === 'musculacao') {
      onSave({
        ...base,
        muscle_group: muscleGroup,
        target_muscle: targetMuscle,
        target_muscles: targetMuscle ? [targetMuscle] : [],
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        rest_seconds: Number(restSeconds),
        running_type: '',
        run_cycles: [],
      })
    } else {
      const runCycles = [{ cycle_number: 1, run_repeats: null, run_blocks: segments }]
      onSave({
        ...base,
        muscle_group: '',
        target_muscle: '',
        target_muscles: [],
        sets: null,
        reps: null,
        weight: null,
        rest_seconds: null,
        running_type: runningType,
        run_cycles: runCycles,
      })
    }
  }

  const muscles = MUSCLES_BY_GROUP[muscleGroup] || []

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <div>
        <label className="text-xs text-muted mb-1 block">Tipo</label>
        <select value={type} onChange={e => setType(e.target.value)}
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
          <option value="musculacao">Musculação</option>
          <option value="corrida">Corrida</option>
        </select>
      </div>

      {/* Name */}
      <div>
        <label className="text-xs text-muted mb-1 block">Nome</label>
        <input value={name} onChange={e => setName(e.target.value)} required
          placeholder="Ex: Agachamento Goblet"
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
      </div>

      {type === 'musculacao' ? (
        <>
          {/* Muscle group */}
          <div>
            <label className="text-xs text-muted mb-1 block">Grupo muscular</label>
            <select value={muscleGroup} onChange={e => { setMuscleGroup(e.target.value); setTargetMuscle('') }}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
              <option value="">Selecione</option>
              {MUSCLE_GROUPS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {muscleGroup && muscles.length > 0 && (
            <div>
              <label className="text-xs text-muted mb-1 block">Músculo-alvo</label>
              <select value={targetMuscle} onChange={e => setTargetMuscle(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
                <option value="">Selecione</option>
                {muscles.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          )}

          {/* Sets/Reps/Weight/Rest */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Séries', val: sets, set: setSets },
              { label: 'Reps', val: reps, set: setReps },
              { label: 'Carga (kg)', val: weight, set: setWeight },
              { label: 'Descanso (s)', val: restSeconds, set: setRestSeconds },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-muted mb-1 block">{f.label}</label>
                <input type="number" min="0" value={f.val} onChange={e => f.set(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Running type */}
          <div>
            <label className="text-xs text-muted mb-1 block">Tipo de corrida</label>
            <select value={runningType} onChange={e => setRunningType(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
              {RUNNING_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
            </select>
          </div>

          {/* Segments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted">Segmentos do ciclo (C1)</label>
              <button type="button" onClick={addSegment}
                className="text-xs text-primary flex items-center gap-1 hover:text-primary-dim">
                <Plus size={12} /> Segmento
              </button>
            </div>
            <div className="space-y-3">
              {segments.map((seg, si) => (
                <div key={si} className="bg-card border border-border rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">Segmento {si + 1}</span>
                    {segments.length > 1 && (
                      <button type="button" onClick={() => removeSegment(si)} className="text-muted hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted">Seção</label>
                      <select value={seg.section} onChange={e => updateSegment(si, 'section', e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary mt-0.5">
                        {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted">Repetições</label>
                      <input type="number" min="1" value={seg.repeat}
                        onChange={e => updateSegment(si, 'repeat', Number(e.target.value))}
                        className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-primary mt-0.5" />
                    </div>
                  </div>
                  {/* Blocks */}
                  <div className="space-y-1.5">
                    {seg.blocks.map((b, bi) => (
                      <div key={bi} className="flex items-center gap-2">
                        <select value={b.zone} onChange={e => updateBlock(si, bi, 'zone', e.target.value)}
                          className="flex-1 bg-surface border border-border rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-primary">
                          {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                        </select>
                        <input type="number" min="0.5" step="0.5" value={b.duration_min}
                          onChange={e => updateBlock(si, bi, 'duration_min', Number(e.target.value))}
                          className="w-16 bg-surface border border-border rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-primary" />
                        <span className="text-xs text-muted">min</span>
                        {seg.blocks.length > 1 && (
                          <button type="button" onClick={() => removeBlock(si, bi)} className="text-muted hover:text-red-400">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addBlock(si)}
                      className="text-xs text-primary flex items-center gap-1 hover:text-primary-dim">
                      <Plus size={10} /> Bloco
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Image URL */}
      <div>
        <label className="text-xs text-muted mb-1 block">URL da imagem (opcional)</label>
        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-muted mb-1 block">Observações</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Dicas de técnica, foco, etc."
          className="w-full bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-card border border-border text-muted hover:text-white transition-colors text-sm">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary-dim transition-colors disabled:opacity-50">
          {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar exercício'}
        </button>
      </div>
    </form>
  )
}
