import { supabase } from '../lib/supabase';
import { Workout, WorkoutExercise, WorkoutExerciseForm, WorkoutLog } from '../types';

export const workoutService = {
  // ========== TREINOS ==========

  // Listar todos os treinos do usuário
  async list(): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  // Buscar treino por ID com exercícios
  async getById(id: string): Promise<{ workout: Workout; exercises: WorkoutExercise[] }> {
    const { data: workout, error: wError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single();

    if (wError) throw new Error(wError.message);

    const { data: exercises, error: eError } = await supabase
      .from('workout_exercises')
      .select('*, exercise:exercises(*)')
      .eq('workout_id', id)
      .order('order_index');

    if (eError) throw new Error(eError.message);

    return { workout, exercises: exercises ?? [] };
  },

  // Criar treino com exercícios
  async create(
    name: string,
    description: string,
    exerciseForms: WorkoutExerciseForm[],
    userId: string
  ): Promise<Workout> {
    // 1. Cria o treino
    const { data: workout, error: wError } = await supabase
      .from('workouts')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        user_id: userId,
      })
      .select()
      .single();

    if (wError) throw new Error(wError.message);

    // 2. Insere os exercícios do treino
    if (exerciseForms.length > 0) {
      const workoutExercises = exerciseForms.map((ex, index) => ({
        workout_id: workout.id,
        exercise_id: ex.exercise_id,
        sets: parseInt(ex.sets) || 3,
        reps: parseInt(ex.reps) || 12,
        weight: ex.weight ? parseFloat(ex.weight) : null,
        rest_seconds: parseInt(ex.rest_seconds) || 60,
        order_index: index,
      }));

      const { error: eError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (eError) throw new Error(eError.message);
    }

    return workout;
  },

  // Atualizar treino
  async update(
    id: string,
    name: string,
    description: string,
    exerciseForms: WorkoutExerciseForm[]
  ): Promise<void> {
    // 1. Atualiza dados do treino
    const { error: wError } = await supabase
      .from('workouts')
      .update({
        name: name.trim(),
        description: description.trim() || null,
      })
      .eq('id', id);

    if (wError) throw new Error(wError.message);

    // 2. Remove exercícios antigos e insere os novos
    const { error: dError } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', id);

    if (dError) throw new Error(dError.message);

    if (exerciseForms.length > 0) {
      const workoutExercises = exerciseForms.map((ex, index) => ({
        workout_id: id,
        exercise_id: ex.exercise_id,
        sets: parseInt(ex.sets) || 3,
        reps: parseInt(ex.reps) || 12,
        weight: ex.weight ? parseFloat(ex.weight) : null,
        rest_seconds: parseInt(ex.rest_seconds) || 60,
        order_index: index,
      }));

      const { error: eError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (eError) throw new Error(eError.message);
    }
  },

  // Excluir treino
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  // ========== LOGS DE TREINO (Relatório) ==========

  // Registrar treino concluído
  async logWorkout(
    workoutId: string,
    workoutName: string,
    userId: string,
    durationMinutes?: number,
    notes?: string
  ): Promise<WorkoutLog> {
    const { data, error } = await supabase
      .from('workout_logs')
      .insert({
        workout_id: workoutId,
        workout_name: workoutName,
        user_id: userId,
        duration_minutes: durationMinutes || null,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Listar histórico de treinos
  async getLogs(): Promise<WorkoutLog[]> {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  // Excluir log
  async deleteLog(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  // Contar treinos concluídos (para dashboard)
  async getStats(userId: string): Promise<{ totalWorkouts: number; totalLogs: number; totalExercises: number }> {
    const [workouts, logs, exercises] = await Promise.all([
      supabase.from('workouts').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('workout_logs').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('exercises').select('id', { count: 'exact' }).eq('user_id', userId),
    ]);

    return {
      totalWorkouts: workouts.count ?? 0,
      totalLogs: logs.count ?? 0,
      totalExercises: exercises.count ?? 0,
    };
  },
};
