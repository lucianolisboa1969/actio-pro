-- =============================================================
-- ACTIO PRO — Script de configuração do Supabase
-- Execute este script no SQL Editor do seu projeto Supabase
-- =============================================================

-- 1. CRIAR TABELAS
-- ────────────────────────────────────────────────────────────

create table if not exists training_plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  goal text,
  days_per_week integer default 5,
  is_active boolean default true,
  current_day integer default 1,
  current_week integer default 1,
  easy_min_kmh decimal default 8,
  easy_max_kmh decimal default 9,
  moderate_min_kmh decimal default 10,
  moderate_max_kmh decimal default 11,
  hard_min_kmh decimal default 12,
  hard_max_kmh decimal default 14,
  created_by uuid references auth.users(id),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists exercises (
  id uuid default gen_random_uuid() primary key,
  training_plan_id uuid references training_plans(id) on delete cascade,
  name text not null,
  exercise_type text not null,
  muscle_group text,
  target_muscle text,
  target_muscles jsonb default '[]',
  running_type text,
  run_cycles jsonb default '[]',
  run_blocks jsonb default '[]',
  run_repeats integer,
  sets integer,
  reps decimal,
  weight decimal default 0,
  rest_seconds integer default 60,
  notes text,
  image_url text,
  day_number integer,
  "order" integer default 1,
  created_by uuid references auth.users(id),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

create table if not exists workout_logs (
  id uuid default gen_random_uuid() primary key,
  training_plan_id uuid references training_plans(id),
  exercise_id uuid references exercises(id),
  date date default current_date,
  day_number integer,
  week_number integer,
  completed boolean default false,
  sets_completed integer,
  reps_completed decimal,
  weight_used decimal,
  distance_km decimal,
  time_minutes decimal,
  rpe integer,
  notes text,
  created_by uuid references auth.users(id),
  created_date timestamptz default now(),
  updated_date timestamptz default now(),
  unique(training_plan_id, exercise_id, date)
);

-- 2. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

alter table training_plans enable row level security;
alter table exercises enable row level security;
alter table workout_logs enable row level security;

drop policy if exists "training_plans_own" on training_plans;
create policy "training_plans_own" on training_plans
  for all using (created_by = auth.uid());

drop policy if exists "exercises_own" on exercises;
create policy "exercises_own" on exercises
  for all using (created_by = auth.uid());

drop policy if exists "workout_logs_own" on workout_logs;
create policy "workout_logs_own" on workout_logs
  for all using (created_by = auth.uid());

-- 3. DADOS INICIAIS — Fase I
-- ────────────────────────────────────────────────────────────
-- Execute esta parte DEPOIS de criar sua conta no app
-- Substitua SEU_USER_ID pelo seu ID (ver: Supabase → Authentication → Users)

do $$
declare
  v_user_id uuid := auth.uid();  -- pega o ID do usuário logado automaticamente
  v_plan_id uuid;
begin
  -- Plano Fase I
  insert into training_plans (name, description, goal, days_per_week, is_active, current_day, current_week,
    easy_min_kmh, easy_max_kmh, moderate_min_kmh, moderate_max_kmh, hard_min_kmh, hard_max_kmh, created_by)
  values (
    'Fase I',
    'Fase I — Base e Evolução (Corrida + Musculação): Plano em ciclos para retomar consistência e evoluir com segurança, alternando musculação e corrida (sem no mesmo dia). Inclui 2 treinos de força (A: inferiores + core | B: superiores + core) e 3 treinos de corrida (HIIT intervalos, ritmo moderado e longão). Foco em melhorar condicionamento e shape, ganhar força para correr melhor, evoluir nos 5 km e 10 km e construir base para a meia maratona, protegendo joelho, Aquiles e fáscia plantar.',
    'condicionamento', 5, true, 1, 1, 8, 9, 10, 11, 12, 14, v_user_id
  )
  returning id into v_plan_id;

  -- CORRIDA — Intervalos (Dia 1)
  insert into exercises (training_plan_id, name, exercise_type, running_type, run_cycles, notes, day_number, "order", created_by)
  values (v_plan_id, 'Corrida — Intervalos', 'corrida', 'intervalos',
    '[{"cycle_number":1,"run_repeats":null,"run_blocks":[{"section":"warmup","blocks":[{"zone":"leve","duration_min":7}],"repeat":1},{"section":"repeats","blocks":[{"zone":"forte","duration_min":1},{"zone":"leve","duration_min":1}],"repeat":5},{"section":"repeats","blocks":[{"zone":"moderado","duration_min":2},{"zone":"leve","duration_min":1}],"repeat":3},{"section":"cooldown","blocks":[{"zone":"leve","duration_min":1}],"repeat":1}]}]'::jsonb,
    'HIIT Intervalos — Fase I. Estruturas por ciclo (1–4) conforme tabela.', 1, 1, v_user_id);

  -- DIA 2 — Pernas e Glúteos + Core (Musculação A)
  insert into exercises (training_plan_id, name, exercise_type, muscle_group, target_muscle, target_muscles, sets, reps, weight, rest_seconds, notes, image_url, day_number, "order", created_by) values
  (v_plan_id, 'Agachamento Goblet (halter)', 'musculacao', 'pernas_gluteos', 'isquiotibiais', '["isquiotibiais"]', 3, 10, 12, 120, 'Pés firmes, desça controlando e suba empurrando o chão. Tronco alto, joelhos acompanhando a linha dos pés.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/c1da4a89f_agachamento-goblet.jpg', 2, 1, v_user_id),
  (v_plan_id, 'Cadeira extensora', 'musculacao', 'pernas_gluteos', 'isquiotibiais', '["isquiotibiais"]', 3, 12, 3, 90, 'Ajuste o banco para alinhar o joelho com o eixo da máquina. Controle na volta e evite "bater" o peso no fim do movimento.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/d492f8e47_cadeira_Extensora.webp', 2, 2, v_user_id),
  (v_plan_id, 'Hip Thrust (barra ou halter)', 'musculacao', 'pernas_gluteos', 'gluteos', '["gluteos"]', 3, 12, 20, 90, 'Queixo levemente recolhido e costelas "para baixo". Suba até alinhar tronco e coxa, contraia glúteos 1s no topo sem hiperextender a lombar.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/f648e50ff_Hip-Thrust_Hips_720.gif', 2, 6, v_user_id),
  (v_plan_id, 'Elevação de panturrilhas em pé (máquina/halter)', 'musculacao', 'pernas_gluteos', 'panturrilha_gastrocnemio', '["panturrilha_gastrocnemio"]', 3, 15, 0, 60, 'Suba forte, pause 1s no alto e desça em 2–3s. Amplitude completa ajuda fascite/Aquiles; evite "quicar".', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/3b49c451f_ElevaodePanturrilhaemP.jpg', 2, 4, v_user_id),
  (v_plan_id, 'Elevação de panturrilhas sentado (máquina/halter no joelho)', 'musculacao', 'pernas_gluteos', 'panturrilha_soleo', '["panturrilha_soleo"]', 2, 15, 0, 60, 'Mesma ideia: amplitude total e descida lenta. Mantenha o joelho flexionado e foque no controle, não em carga alta.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/4b23c99a6_panturrilhasentado.gif', 2, 5, v_user_id),
  (v_plan_id, 'Levantamento Terra Romeno (halteres)', 'musculacao', 'pernas_gluteos', 'isquiotibiais', '["isquiotibiais"]', 3, 10, 24, 120, 'Quadril vai para trás (dobradiça), costas neutras e halteres "colados" no corpo. Sinta alongar posterior e glúteos; não arredonde lombar.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/2386928e9_levantamento.gif', 2, 7, v_user_id),
  (v_plan_id, 'Dead Bug', 'musculacao', 'core', 'transverso', '["transverso"]', 3, 10, 0, 45, 'Lombar colada no chão o tempo todo. Movimente braço/perna devagar e pare antes de perder a estabilidade. Reps por lado.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/b61de9413_deadbug.gif', 2, 3, v_user_id);

  -- CORRIDA — Ritmo (Dia 3)
  insert into exercises (training_plan_id, name, exercise_type, running_type, run_cycles, notes, day_number, "order", created_by)
  values (v_plan_id, 'Corrida — Ritmo', 'corrida', 'ritmo',
    '[{"cycle_number":1,"run_repeats":null,"run_blocks":[{"section":"warmup","blocks":[{"zone":"leve","duration_min":5}],"repeat":1},{"section":"repeats","blocks":[{"zone":"leve","duration_min":10},{"zone":"moderado","duration_min":5},{"zone":"leve","duration_min":10},{"zone":"moderado","duration_min":5},{"zone":"leve","duration_min":5}],"repeat":1}]}]'::jsonb,
    'Ritmo — Fase I. Estruturas por ciclo (1–4) conforme tabela.', 3, 1, v_user_id);

  -- DIA 4 — Superiores + Core (Musculação B)
  insert into exercises (training_plan_id, name, exercise_type, muscle_group, target_muscle, target_muscles, sets, reps, weight, rest_seconds, notes, image_url, day_number, "order", created_by) values
  (v_plan_id, 'Crucifixo inverso (halteres)', 'musculacao', 'superiores', 'deltoide_posterior', '["deltoide_posterior"]', 2, 15, 0, 60, 'Tronco inclinado, costas neutras e movimento abrindo os braços com controle. Foque na parte de trás do ombro e na escápula estável.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/fdaddb98d_crucifixo-invertido-com-halteres-no-banco-inclinado-360.gif', 4, 1, v_user_id),
  (v_plan_id, 'Desenvolvimento de ombros com halteres (sentado)', 'musculacao', 'superiores', 'deltoide_anterior', '["deltoide_anterior"]', 3, 10, 0, 90, 'Core firme e glúteos contraídos; suba em linha reta sem arquear as costas. Pare antes de perder controle do ombro.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/7574196ad_Desenvolvimento-de-Ombro-no-Banco-com-Halteres-1.webp', 4, 2, v_user_id),
  (v_plan_id, 'Elevação lateral (halter)', 'musculacao', 'superiores', 'deltoide_medial', '["deltoide_medial"]', 2, 15, 0, 60, 'Cotovelos levemente flexionados, levante até a linha dos ombros sem "roubar". Pense em afastar os braços para os lados, não "jogar" peso.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/c5377a5ec_ombros-elevacao-lateral-de-ombros-com-halteres.gif', 4, 3, v_user_id),
  (v_plan_id, 'Prancha lateral', 'musculacao', 'core', 'obliquos', '["obliquos"]', 2, 45, 0, 45, 'Corpo em linha reta, quadril alto e ombro empilhado sobre o cotovelo. Se tremer demais, reduza tempo e mantenha a forma. Reps por lado. Tempo em segundos.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/c398c1986_prancha-lateral.gif', 4, 4, v_user_id),
  (v_plan_id, 'Puxada alta (pulldown)', 'musculacao', 'superiores', 'dorsais', '["dorsais"]', 3, 12, 0, 90, 'Comece "encaixando" as escápulas e puxe a barra até a altura do peito. Evite balançar o tronco; suba controlando.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/6b029c516_pulldown-corda.gif', 4, 5, v_user_id),
  (v_plan_id, 'Remada unilateral com halter (ou remada máquina)', 'musculacao', 'superiores', 'dorsais', '["dorsais"]', 3, 10, 0, 90, 'Puxe com o cotovelo (não com a mão), mantenha peito aberto e ombro longe da orelha. Na máquina, mesma lógica: controle e amplitude.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/470e367e8_remada-unilateral.gif', 4, 6, v_user_id),
  (v_plan_id, 'Supino com halteres (ou máquina chest press)', 'musculacao', 'superiores', 'peitoral', '["peitoral"]', 3, 10, 0, 90, 'Escápulas "para trás e para baixo", punhos neutros e cotovelos em ~45°. Desça controlando e suba sem travar os ombros.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/ccbfb4fbb_supino-reto-com-halteres.gif', 4, 7, v_user_id),
  (v_plan_id, 'Tríceps testa (halter)', 'musculacao', 'superiores', 'triceps', '["triceps"]', 2, 12, 0, 60, 'Cotovelos apontados para cima e parados; só o antebraço se move. Desça devagar e suba sem "espalhar" os cotovelos.', 'https://base44.app/api/apps/698b48bd3625820f7f15c2cc/files/public/698b48bd3625820f7f15c2cc/7cb961440_dumbbell-lying-triceps-extension.gif', 4, 8, v_user_id);

  -- LONGÃO (Dia 5)
  insert into exercises (training_plan_id, name, exercise_type, running_type, run_cycles, notes, day_number, "order", created_by)
  values (v_plan_id, 'Longão — Fase I', 'corrida', 'longao', '[]'::jsonb,
    'Longão — Fase I. Estruturas por ciclo (1–4) conforme tabela.', 5, 1, v_user_id);

end $$;
