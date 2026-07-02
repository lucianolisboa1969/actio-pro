import { supabase } from '@/lib/supabase'

// ── Training Plans ────────────────────────────────────────────────────────────
export const TrainingPlan = {
  async list() {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .order('created_date', { ascending: false })
    if (error) throw error
    return data
  },

  async get(id) {
    const { data, error } = await supabase
      .from('training_plans')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('training_plans')
      .insert({ ...payload, created_by: user.id })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('training_plans')
      .update({ ...payload, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('training_plans').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Exercises ─────────────────────────────────────────────────────────────────
export const Exercise = {
  async listByPlan(planId) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('training_plan_id', planId)
      .order('day_number', { ascending: true })
      .order('order', { ascending: true })
    if (error) throw error
    return data
  },

  async listByDay(planId, dayNumber) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('training_plan_id', planId)
      .eq('day_number', dayNumber)
      .order('order', { ascending: true })
    if (error) throw error
    return data
  },

  async get(id) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('exercises')
      .insert({ ...payload, created_by: user.id })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('exercises')
      .update({ ...payload, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Workout Logs ──────────────────────────────────────────────────────────────
export const WorkoutLog = {
  async listByPlan(planId) {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('training_plan_id', planId)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  },

  async listByDay(planId, dayNumber) {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('training_plan_id', planId)
      .eq('day_number', dayNumber)
      .order('created_date', { ascending: false })
    if (error) throw error
    return data
  },

  async listRunning(planId) {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*, exercises(name, running_type, exercise_type)')
      .eq('training_plan_id', planId)
      .not('distance_km', 'is', null)
      .gt('distance_km', 0)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  },

  async getTodayLogs(planId, dayNumber) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('training_plan_id', planId)
      .eq('day_number', dayNumber)
      .eq('date', today)
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('workout_logs')
      .insert({ ...payload, created_by: user.id })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('workout_logs')
      .update({ ...payload, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('workout_logs').delete().eq('id', id)
    if (error) throw error
  },

  async markExerciseComplete(planId, exerciseId, dayNumber, weekNumber, extra = {}) {
    const { data: { user } } = await supabase.auth.getUser()
    const today = new Date().toISOString().split('T')[0]
    // Upsert: one log per exercise per day
    const { data, error } = await supabase
      .from('workout_logs')
      .upsert({
        training_plan_id: planId,
        exercise_id: exerciseId,
        day_number: dayNumber,
        week_number: weekNumber,
        date: today,
        completed: true,
        created_by: user.id,
        ...extra,
      }, { onConflict: 'training_plan_id,exercise_id,date' })
      .select()
      .single()
    if (error) throw error
    return data
  },
}
