import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ChevronRight, Trash2, Edit2, Dumbbell, Activity } from 'lucide-react'
import Layout from '@/components/Layout'
import Modal from '@/components/ui/Modal'
import ExerciseForm from '@/components/workout/ExerciseForm'
import { TrainingPlan, Exercise } from '@/api/entities'
import { GOAL_LABELS, MUSCLE_GROUP_LABELS, RUNNING_TYPE_LABELS } from '@/lib/utils'

export default function TrainingPlanPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [selectedDay, setSelectedDay] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editExercise, setEditExercise] = useState(null)
  const [addDay, setAddDay] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { data: plan } = useQuery({
    queryKey: ['training_plan', id],
    queryFn: () => TrainingPlan.get(id),
  })

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises', id],
    queryFn: () => Exercise.listByPlan(id),
  })

  const createEx = useMutation({
    mutationFn: (payload) => Exercise.create(payload),
    onSuccess: () => { qc.invalidateQueries(['exercises', id]); setShowAddModal(false) },
  })

  const updateEx = useMutation({
    mutationFn: ({ exId, payload }) => Exercise.update(exId, payload),
    onSuccess: () => { qc.invalidateQueries(['exercises', id]); setEditExercise(null) },
  })

  const deleteEx = useMutation({
    mutationFn: (exId) => Exercise.delete(exId),
    onSuccess: () => { qc.invalidateQueries(['exercises', id]); setDeleteConfirm(null) },
  })

  const dayNumbers = [...new Set(exercises.map(e => e.day_number))].sort((a, b) => a - b)
  const allDays = Array.from({ length: plan?.days_per_week || 5 }, (_, i) => i + 1)

  const dayExercises = selectedDay !== null ? exercises.filter(e => e.day_number === selectedDay) : []

  // Day label helper
  function dayTags(dayNum) {
    const exs = exercises.filter(e => e.day_number === dayNum)
    const runs = exs.filter(e => e.exercise_type === 'corrida')
    const muscles = exs.filter(e => e.exercise_type === 'musculacao')
    const tags = []
    if (runs.length) tags.push(RUNNING_TYPE_LABELS[runs[0].running_type] || 'Corrida')
    if (muscles.length) {
      const groups = [...new Set(muscles.map(e => e.muscle_group).filter(Boolean))]
      groups.forEach(g => tags.push(MUSCLE_GROUP_LABELS[g] || g))
    }
    return tags
  }

  if (!plan) return <Layout title="Plano" back="/home"><div className="py-12 text-center text-muted">Carregando...</div></Layout>

  return (
    <Layout title={plan.name} back="/home">
      <div className="pt-4 space-y-5">
        {/* Plan header */}
        <div className="card">
          <p className="text-muted text-sm">{plan.description}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1">
              {GOAL_LABELS[plan.goal] || plan.goal}
            </span>
            <span className="text-xs bg-surface border border-border text-muted rounded-full px-2.5 py-1">
              {plan.days_per_week}x por semana
            </span>
            <span className="text-xs bg-surface border border-border text-muted rounded-full px-2.5 py-1">
              {exercises.length} exercícios
            </span>
            <span className="text-xs bg-surface border border-border text-muted rounded-full px-2.5 py-1">
              Ciclo {plan.current_week || 1}/4
            </span>
          </div>
        </div>

        {/* Days grid */}
        <div>
          <h2 className="font-semibold text-white mb-3 text-sm">Dias do Plano</h2>
          <div className="grid grid-cols-2 gap-3">
            {allDays.map(day => {
              const tags = dayTags(day)
              const count = exercises.filter(e => e.day_number === day).length
              const isToday = plan.current_day === day
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                  className={`card cursor-pointer transition-all hover:border-primary/40 ${
                    selectedDay === day ? 'border-primary/60 bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${isToday ? 'text-primary' : 'text-muted'}`}>
                        {isToday ? '📅' : '📅'}
                      </span>
                      <span className="font-semibold text-white text-sm">Dia {day}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted">
                      <span className="text-xs">{count}</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                  {isToday && <span className="text-xs text-primary mb-1 block">HOJE</span>}
                  <div className="flex flex-wrap gap-1">
                    {tags.map(t => (
                      <span key={t} className="text-xs bg-surface border border-border text-muted rounded px-1.5 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected day exercises */}
        {selectedDay !== null && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm">Dia {selectedDay} — Exercícios</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/treino/${id}/${selectedDay}`)}
                  className="text-xs bg-primary text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-primary-dim transition-colors"
                >
                  Iniciar
                </button>
                <button
                  onClick={() => { setAddDay(selectedDay); setShowAddModal(true) }}
                  className="text-xs bg-surface border border-border text-muted px-3 py-1.5 rounded-lg hover:text-white transition-colors flex items-center gap-1"
                >
                  <Plus size={12} /> Exercício
                </button>
              </div>
            </div>

            {dayExercises.length === 0 ? (
              <div className="card text-center py-6 text-muted text-sm">
                Nenhum exercício ainda.{' '}
                <button onClick={() => { setAddDay(selectedDay); setShowAddModal(true) }} className="text-primary hover:underline">
                  Adicionar
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {dayExercises.map(ex => (
                  <div key={ex.id} className="card flex items-start gap-3">
                    {ex.image_url && (
                      <img src={ex.image_url} alt={ex.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-card" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{ex.name}</p>
                      {ex.exercise_type === 'musculacao' ? (
                        <p className="text-xs text-muted mt-0.5">
                          {ex.sets} séries · {ex.reps} reps · {ex.rest_seconds}s descanso
                          {ex.weight > 0 ? ` · ${ex.weight}kg` : ''}
                        </p>
                      ) : (
                        <p className="text-xs text-muted mt-0.5">
                          Corrida — {RUNNING_TYPE_LABELS[ex.running_type]}
                        </p>
                      )}
                      {ex.notes && (
                        <p className="text-xs text-muted mt-1 line-clamp-2 italic">{ex.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => setEditExercise(ex)}
                        className="p-1.5 text-muted hover:text-white transition-colors rounded-lg hover:bg-surface"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(ex)}
                        className="p-1.5 text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-surface"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add exercise modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title={`Novo exercício — Dia ${addDay}`}>
        <ExerciseForm
          dayNumber={addDay}
          planId={id}
          onSave={payload => createEx.mutate(payload)}
          onCancel={() => setShowAddModal(false)}
          saving={createEx.isPending}
        />
      </Modal>

      {/* Edit exercise modal */}
      <Modal open={!!editExercise} onClose={() => setEditExercise(null)} title="Editar exercício">
        {editExercise && (
          <ExerciseForm
            initial={editExercise}
            dayNumber={editExercise.day_number}
            planId={id}
            onSave={payload => updateEx.mutate({ exId: editExercise.id, payload })}
            onCancel={() => setEditExercise(null)}
            saving={updateEx.isPending}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remover exercício">
        <div className="space-y-4">
          <p className="text-white">Remover <strong>{deleteConfirm?.name}</strong>?</p>
          <p className="text-muted text-sm">Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-3 rounded-xl bg-card border border-border text-muted hover:text-white transition-colors text-sm">
              Cancelar
            </button>
            <button
              onClick={() => deleteEx.mutate(deleteConfirm.id)}
              disabled={deleteEx.isPending}
              className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50">
              {deleteEx.isPending ? 'Removendo...' : 'Remover'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
