-- ============================================================
-- APOLO FIT — Database Schema
-- Run this in Supabase SQL Editor (project: xkdoxyswcycwolagqtgj)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (one row per auth.users entry)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('trainer', 'student')),
  full_name   text not null,
  email       text not null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);

-- ============================================================
-- STUDENTS
-- ============================================================
create table public.students (
  id                uuid primary key default uuid_generate_v4(),
  trainer_id        uuid not null references public.profiles(id) on delete cascade,
  portal_user_id    uuid references public.profiles(id) on delete set null,
  full_name         text not null,
  email             text,
  phone             text,
  date_of_birth     date,
  gender            text check (gender in ('male', 'female', 'other')),
  goal              text,
  notes             text,
  avatar_url        text,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_students_trainer_id    on public.students(trainer_id);
create index idx_students_portal_user_id on public.students(portal_user_id);
create index idx_students_is_active     on public.students(is_active);

-- ============================================================
-- EXERCISES
-- ============================================================
create table public.exercises (
  id            uuid primary key default uuid_generate_v4(),
  trainer_id    uuid references public.profiles(id) on delete cascade,
  name          text not null,
  description   text,
  instructions  text,
  muscle_group  text not null check (muscle_group in (
                  'chest','back','shoulders','biceps','triceps',
                  'forearms','core','glutes','quads','hamstrings',
                  'calves','full_body','cardio','mobility'
                )),
  category      text not null check (category in (
                  'strength','hypertrophy','endurance',
                  'cardio','mobility','power'
                )),
  equipment     text check (equipment in (
                  'barbell','dumbbell','machine','cable',
                  'bodyweight','kettlebell','bands','other'
                )),
  image_url     text,
  video_url     text,
  is_global     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_exercises_trainer_id   on public.exercises(trainer_id);
create index idx_exercises_muscle_group on public.exercises(muscle_group);
create index idx_exercises_category     on public.exercises(category);
create index idx_exercises_is_global    on public.exercises(is_global);

-- ============================================================
-- WORKOUTS
-- ============================================================
create table public.workouts (
  id              uuid primary key default uuid_generate_v4(),
  trainer_id      uuid not null references public.profiles(id) on delete cascade,
  student_id      uuid not null references public.students(id) on delete cascade,
  template_id     uuid,
  name            text not null,
  description     text,
  goal            text,
  duration_weeks  integer,
  status          text not null default 'active' check (status in (
                    'active','completed','archived'
                  )),
  is_current      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_workouts_trainer_id on public.workouts(trainer_id);
create index idx_workouts_student_id on public.workouts(student_id);
create index idx_workouts_status     on public.workouts(status);

-- ============================================================
-- WORKOUT_SECTIONS
-- ============================================================
create table public.workout_sections (
  id          uuid primary key default uuid_generate_v4(),
  workout_id  uuid not null references public.workouts(id) on delete cascade,
  label       text not null,
  title       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_workout_sections_workout_id on public.workout_sections(workout_id);

-- ============================================================
-- WORKOUT_EXERCISES
-- ============================================================
create table public.workout_exercises (
  id              uuid primary key default uuid_generate_v4(),
  section_id      uuid not null references public.workout_sections(id) on delete cascade,
  exercise_id     uuid not null references public.exercises(id) on delete restrict,
  sort_order      integer not null default 0,
  sets            integer,
  reps            text,
  load            text,
  rest_seconds    integer,
  tempo           text,
  notes           text,
  is_superset     boolean not null default false,
  superset_group  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_workout_exercises_section_id  on public.workout_exercises(section_id);
create index idx_workout_exercises_exercise_id on public.workout_exercises(exercise_id);

-- ============================================================
-- WORKOUT_TEMPLATES
-- ============================================================
create table public.workout_templates (
  id          uuid primary key default uuid_generate_v4(),
  trainer_id  uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  goal        text,
  tags        text[],
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_workout_templates_trainer_id on public.workout_templates(trainer_id);

-- FK from workouts → templates (deferred until templates table exists)
alter table public.workouts
  add constraint fk_workouts_template
  foreign key (template_id) references public.workout_templates(id)
  on delete set null;

-- ============================================================
-- WORKOUT_TEMPLATE_SECTIONS
-- ============================================================
create table public.workout_template_sections (
  id           uuid primary key default uuid_generate_v4(),
  template_id  uuid not null references public.workout_templates(id) on delete cascade,
  label        text not null,
  title        text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index idx_wts_template_id on public.workout_template_sections(template_id);

-- ============================================================
-- WORKOUT_TEMPLATE_EXERCISES
-- ============================================================
create table public.workout_template_exercises (
  id              uuid primary key default uuid_generate_v4(),
  section_id      uuid not null references public.workout_template_sections(id) on delete cascade,
  exercise_id     uuid not null references public.exercises(id) on delete restrict,
  sort_order      integer not null default 0,
  sets            integer,
  reps            text,
  load            text,
  rest_seconds    integer,
  tempo           text,
  notes           text,
  is_superset     boolean not null default false,
  superset_group  text,
  created_at      timestamptz not null default now()
);

create index idx_wte_section_id on public.workout_template_exercises(section_id);

-- ============================================================
-- ASSESSMENTS
-- ============================================================
create table public.assessments (
  id                uuid primary key default uuid_generate_v4(),
  trainer_id        uuid not null references public.profiles(id) on delete cascade,
  student_id        uuid not null references public.students(id) on delete cascade,
  assessed_at       date not null default current_date,
  weight_kg         numeric(5,2),
  height_cm         numeric(5,2),
  body_fat_pct      numeric(4,2),
  lean_mass_kg      numeric(5,2),
  fat_mass_kg       numeric(5,2),
  chest_cm          numeric(5,2),
  waist_cm          numeric(5,2),
  hip_cm            numeric(5,2),
  left_arm_cm       numeric(5,2),
  right_arm_cm      numeric(5,2),
  left_thigh_cm     numeric(5,2),
  right_thigh_cm    numeric(5,2),
  left_calf_cm      numeric(5,2),
  right_calf_cm     numeric(5,2),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_assessments_student_id  on public.assessments(student_id);
create index idx_assessments_trainer_id  on public.assessments(trainer_id);
create index idx_assessments_assessed_at on public.assessments(assessed_at);

-- ============================================================
-- PROGRESS_PHOTOS
-- ============================================================
create table public.progress_photos (
  id            uuid primary key default uuid_generate_v4(),
  trainer_id    uuid not null references public.profiles(id) on delete cascade,
  student_id    uuid not null references public.students(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete set null,
  storage_path  text not null,
  public_url    text,
  angle         text check (angle in ('front','back','left','right')),
  taken_at      date not null default current_date,
  notes         text,
  created_at    timestamptz not null default now()
);

create index idx_progress_photos_student_id on public.progress_photos(student_id);
create index idx_progress_photos_taken_at   on public.progress_photos(taken_at);

-- ============================================================
-- STUDENT_FILES
-- ============================================================
create table public.student_files (
  id            uuid primary key default uuid_generate_v4(),
  trainer_id    uuid not null references public.profiles(id) on delete cascade,
  student_id    uuid not null references public.students(id) on delete cascade,
  storage_path  text not null,
  file_name     text not null,
  file_size     bigint,
  mime_type     text,
  category      text check (category in ('exam','contract','anamnesis','other')),
  notes         text,
  created_at    timestamptz not null default now()
);

create index idx_student_files_student_id on public.student_files(student_id);

-- ============================================================
-- TRIGGERS — updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger trg_students_updated_at
  before update on public.students
  for each row execute procedure public.handle_updated_at();

create trigger trg_exercises_updated_at
  before update on public.exercises
  for each row execute procedure public.handle_updated_at();

create trigger trg_workouts_updated_at
  before update on public.workouts
  for each row execute procedure public.handle_updated_at();

create trigger trg_workout_exercises_updated_at
  before update on public.workout_exercises
  for each row execute procedure public.handle_updated_at();

create trigger trg_workout_templates_updated_at
  before update on public.workout_templates
  for each row execute procedure public.handle_updated_at();

create trigger trg_assessments_updated_at
  before update on public.assessments
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGN-UP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'trainer'),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
