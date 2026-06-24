-- ============================================
-- GymTrack - Schema do Banco de Dados (Supabase)
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- Tabela de exercícios (CRUD 1)
create table exercises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  muscle_group text not null,
  description text,
  created_at timestamptz default now() not null
);

-- Tabela de treinos (CRUD 2)
create table workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now() not null
);

-- Exercícios de cada treino (relação N:N)
create table workout_exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references workouts(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  sets integer not null default 3,
  reps integer not null default 12,
  weight numeric(6,2),
  rest_seconds integer default 60,
  order_index integer not null default 0
);

-- Registro de treinos concluídos (relatório)
create table workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  workout_id uuid references workouts(id) on delete set null,
  workout_name text not null,
  completed_at timestamptz default now() not null,
  duration_minutes integer,
  notes text
);

-- Registros de IMC (recurso extra)
create table bmi_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  weight numeric(5,2) not null,
  height numeric(4,2) not null,
  bmi numeric(4,1) not null,
  recorded_at timestamptz default now() not null
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table exercises enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table workout_logs enable row level security;
alter table bmi_records enable row level security;

-- Exercícios: cada usuário só acessa os seus
create policy "exercises_policy" on exercises
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Treinos: cada usuário só acessa os seus
create policy "workouts_policy" on workouts
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Exercícios do treino: acesso via treino do usuário
create policy "workout_exercises_policy" on workout_exercises
  for all using (
    workout_id in (select id from workouts where user_id = auth.uid())
  )
  with check (
    workout_id in (select id from workouts where user_id = auth.uid())
  );

-- Logs de treino: cada usuário só acessa os seus
create policy "workout_logs_policy" on workout_logs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Registros de IMC: cada usuário só acessa os seus
create policy "bmi_records_policy" on bmi_records
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
