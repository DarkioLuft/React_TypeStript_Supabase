// Tipos do sistema GymTrack

export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  muscle_group: string;
  description: string | null;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number | null;
  rest_seconds: number;
  order_index: number;
  exercise?: Exercise; // join
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_id: string | null;
  workout_name: string;
  completed_at: string;
  duration_minutes: number | null;
  notes: string | null;
}

export interface BmiRecord {
  id: string;
  user_id: string;
  weight: number;
  height: number;
  bmi: number;
  recorded_at: string;
}

// Tipos auxiliares para formulários
export interface ExerciseForm {
  name: string;
  muscle_group: string;
  description: string;
}

export interface WorkoutForm {
  name: string;
  description: string;
}

export interface WorkoutExerciseForm {
  exercise_id: string;
  exercise_name?: string;
  sets: string;
  reps: string;
  weight: string;
  rest_seconds: string;
}

// Grupos musculares disponíveis
export const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Glúteos',
  'Abdômen',
  'Antebraço',
  'Panturrilha',
  'Corpo inteiro',
] as const;
