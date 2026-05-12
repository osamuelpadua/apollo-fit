-- ============================================================
-- APOLO FIT — Seed: Global Exercise Library
-- Run AFTER all migrations
-- ============================================================

insert into public.exercises
  (name, description, muscle_group, category, equipment, is_global)
values
  -- PEITO
  ('Supino Reto com Barra',      'Exercício básico de peito com barra em banco horizontal', 'chest', 'hypertrophy', 'barbell',    true),
  ('Supino Inclinado com Haltere','Trabalha a porção superior do peitoral', 'chest', 'hypertrophy', 'dumbbell',   true),
  ('Crucifixo com Haltere',      'Isolamento do peitoral em banco plano',   'chest', 'hypertrophy', 'dumbbell',   true),
  ('Flexão de Braço',            'Exercício funcional de peito sem equipamento', 'chest', 'strength', 'bodyweight', true),
  ('Supino Declinado',           'Trabalha a porção inferior do peitoral',  'chest', 'hypertrophy', 'barbell',    true),
  ('Cross-over',                 'Isolamento do peitoral no cabo',          'chest', 'hypertrophy', 'cable',      true),

  -- COSTAS
  ('Puxada Frente',              'Trabalha o dorsal amplo',                 'back', 'hypertrophy', 'machine',    true),
  ('Remada Curvada com Barra',   'Exercício básico para espessura das costas', 'back', 'strength', 'barbell',   true),
  ('Remada Unilateral',          'Remada unilateral com haltere',           'back', 'hypertrophy', 'dumbbell',  true),
  ('Barra Fixa',                 'Pull-up com peso corporal',               'back', 'strength',    'bodyweight', true),
  ('Remada Serrote',             'Remada apoiada no banco',                 'back', 'hypertrophy', 'dumbbell',  true),
  ('Puxada pelo Peitoral',       'Pulldown por trás no cabo',               'back', 'hypertrophy', 'cable',     true),

  -- OMBROS
  ('Desenvolvimento com Barra',  'Press militar com barra',                 'shoulders', 'strength',    'barbell',    true),
  ('Elevação Lateral',           'Isolamento do deltoide médio',            'shoulders', 'hypertrophy', 'dumbbell',   true),
  ('Elevação Frontal',           'Trabalha a cabeça anterior do deltóide',  'shoulders', 'hypertrophy', 'dumbbell',   true),
  ('Encolhimento de Ombros',     'Trapézio superior',                       'shoulders', 'hypertrophy', 'dumbbell',   true),
  ('Desenvolvimento Arnold',     'Variação do desenvolvimento com rotação', 'shoulders', 'hypertrophy', 'dumbbell',   true),

  -- BÍCEPS
  ('Rosca Direta',               'Curl básico de bíceps com barra',         'biceps', 'hypertrophy', 'barbell',    true),
  ('Rosca Alternada',            'Curl alternado com haltere',              'biceps', 'hypertrophy', 'dumbbell',   true),
  ('Rosca Martelo',              'Treina braquial e bíceps',                'biceps', 'hypertrophy', 'dumbbell',   true),
  ('Rosca Concentrada',          'Isolamento máximo do bíceps',             'biceps', 'hypertrophy', 'dumbbell',   true),

  -- TRÍCEPS
  ('Tríceps Testa',              'Exercício básico de tríceps com barra',   'triceps', 'hypertrophy', 'barbell',    true),
  ('Tríceps Corda',              'Extensão de tríceps no cabo',             'triceps', 'hypertrophy', 'cable',      true),
  ('Paralelas',                  'Dip no banco ou paralelas',               'triceps', 'strength',    'bodyweight', true),
  ('Tríceps Testa com Haltere',  'Extensão overhead com haltere',          'triceps', 'hypertrophy', 'dumbbell',   true),

  -- ABDÔMEN
  ('Abdominal Reto',             'Crunch básico para o abdômen',            'core', 'strength', 'bodyweight', true),
  ('Prancha',                    'Exercício isométrico de core',            'core', 'strength', 'bodyweight', true),
  ('Abdominal Oblíquo',         'Crunch oblíquo para cintura',             'core', 'strength', 'bodyweight', true),
  ('Abdominal com Roda',         'Rollout com roda abdominal',              'core', 'strength', 'bodyweight', true),

  -- PERNAS / QUADRÍCEPS
  ('Agachamento Livre',          'Agachamento com barra nas costas',        'quads', 'strength',    'barbell',    true),
  ('Leg Press',                  'Press de pernas na máquina',              'quads', 'hypertrophy', 'machine',    true),
  ('Extensão de Pernas',         'Isolamento do quadríceps',                'quads', 'hypertrophy', 'machine',    true),
  ('Agachamento Búlgaro',        'Agachamento unilateral com perna elevada','quads', 'hypertrophy', 'dumbbell',   true),
  ('Avanço',                     'Lunge com halteres',                      'quads', 'hypertrophy', 'dumbbell',   true),

  -- GLÚTEOS / POSTERIOR
  ('Stiff',                      'Exercício para posterior de coxa e glúteos', 'hamstrings', 'strength', 'barbell', true),
  ('Mesa Flexora',               'Isolamento do bíceps femoral',            'hamstrings', 'hypertrophy', 'machine', true),
  ('Hip Thrust',                 'Elevação de quadril para glúteos',        'glutes',     'hypertrophy', 'barbell', true),
  ('Agachamento Sumô',           'Agachamento com ênfase nos glúteos e adutores', 'glutes', 'strength', 'barbell', true),

  -- PANTURRILHA
  ('Panturrilha em Pé',          'Elevação de calcanhares em pé',           'calves', 'hypertrophy', 'machine',    true),
  ('Panturrilha Sentado',        'Elevação de calcanhares sentado',         'calves', 'hypertrophy', 'machine',    true),

  -- CARDIO / CORPO INTEIRO
  ('Corrida na Esteira',         'Cardio de baixa a alta intensidade',      'cardio',    'endurance', 'other',      true),
  ('Burpee',                     'Exercício funcional de alta intensidade', 'full_body', 'cardio',    'bodyweight', true),
  ('Pulo na Caixa',              'Box jump para potência',                  'full_body', 'power',     'other',      true),
  ('Kettlebell Swing',           'Swing com kettlebell para glúteos e core','full_body', 'power',     'kettlebell', true),

  -- MOBILIDADE
  ('Alongamento de Quadríceps',  'Alongamento estático do quadríceps',      'mobility', 'mobility', 'bodyweight', true),
  ('Mobilidade de Quadril',      'Rotação e abertura de quadril',           'mobility', 'mobility', 'bodyweight', true),
  ('Foam Roll Costas',           'Auto-massagem com rolo de espuma',        'mobility', 'mobility', 'other',      true);
