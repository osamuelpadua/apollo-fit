-- ============================================================
-- APOLO FIT — Row Level Security Policies
-- Run AFTER 001_schema.sql
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles                    enable row level security;
alter table public.students                    enable row level security;
alter table public.exercises                   enable row level security;
alter table public.workouts                    enable row level security;
alter table public.workout_sections            enable row level security;
alter table public.workout_exercises           enable row level security;
alter table public.workout_templates           enable row level security;
alter table public.workout_template_sections   enable row level security;
alter table public.workout_template_exercises  enable row level security;
alter table public.assessments                 enable row level security;
alter table public.progress_photos             enable row level security;
alter table public.student_files               enable row level security;

-- ============================================================
-- PROFILES
-- ============================================================
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Trainers can read profiles of their students (for portal user lookup)
create policy "profiles_select_trainer_students"
  on public.profiles for select
  using (
    exists (
      select 1 from public.students s
      where s.portal_user_id = profiles.id
        and s.trainer_id = auth.uid()
    )
  );

-- ============================================================
-- STUDENTS
-- ============================================================
create policy "students_select_trainer"
  on public.students for select
  using (trainer_id = auth.uid());

create policy "students_insert_trainer"
  on public.students for insert
  with check (trainer_id = auth.uid());

create policy "students_update_trainer"
  on public.students for update
  using (trainer_id = auth.uid());

create policy "students_delete_trainer"
  on public.students for delete
  using (trainer_id = auth.uid());

-- Student portal: read own record
create policy "students_select_own_portal"
  on public.students for select
  using (portal_user_id = auth.uid());

-- ============================================================
-- EXERCISES (trainer's own + global)
-- ============================================================
create policy "exercises_select"
  on public.exercises for select
  using (is_global = true or trainer_id = auth.uid());

create policy "exercises_insert"
  on public.exercises for insert
  with check (trainer_id = auth.uid());

create policy "exercises_update"
  on public.exercises for update
  using (trainer_id = auth.uid());

create policy "exercises_delete"
  on public.exercises for delete
  using (trainer_id = auth.uid());

-- ============================================================
-- WORKOUTS
-- ============================================================
create policy "workouts_select_trainer"
  on public.workouts for select
  using (trainer_id = auth.uid());

create policy "workouts_insert_trainer"
  on public.workouts for insert
  with check (trainer_id = auth.uid());

create policy "workouts_update_trainer"
  on public.workouts for update
  using (trainer_id = auth.uid());

create policy "workouts_delete_trainer"
  on public.workouts for delete
  using (trainer_id = auth.uid());

-- Portal: student reads their own workouts
create policy "workouts_select_student_portal"
  on public.workouts for select
  using (
    exists (
      select 1 from public.students s
      where s.id = workouts.student_id
        and s.portal_user_id = auth.uid()
    )
  );

-- ============================================================
-- WORKOUT_SECTIONS
-- ============================================================
create policy "workout_sections_select"
  on public.workout_sections for select
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_sections.workout_id
        and (
          w.trainer_id = auth.uid()
          or exists (
            select 1 from public.students s
            where s.id = w.student_id and s.portal_user_id = auth.uid()
          )
        )
    )
  );

create policy "workout_sections_insert"
  on public.workout_sections for insert
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_sections.workout_id
        and w.trainer_id = auth.uid()
    )
  );

create policy "workout_sections_update"
  on public.workout_sections for update
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_sections.workout_id
        and w.trainer_id = auth.uid()
    )
  );

create policy "workout_sections_delete"
  on public.workout_sections for delete
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_sections.workout_id
        and w.trainer_id = auth.uid()
    )
  );

-- ============================================================
-- WORKOUT_EXERCISES
-- ============================================================
create policy "workout_exercises_select"
  on public.workout_exercises for select
  using (
    exists (
      select 1
      from public.workout_sections ws
      join public.workouts w on w.id = ws.workout_id
      where ws.id = workout_exercises.section_id
        and (
          w.trainer_id = auth.uid()
          or exists (
            select 1 from public.students s
            where s.id = w.student_id and s.portal_user_id = auth.uid()
          )
        )
    )
  );

create policy "workout_exercises_insert"
  on public.workout_exercises for insert
  with check (
    exists (
      select 1
      from public.workout_sections ws
      join public.workouts w on w.id = ws.workout_id
      where ws.id = workout_exercises.section_id
        and w.trainer_id = auth.uid()
    )
  );

create policy "workout_exercises_update"
  on public.workout_exercises for update
  using (
    exists (
      select 1
      from public.workout_sections ws
      join public.workouts w on w.id = ws.workout_id
      where ws.id = workout_exercises.section_id
        and w.trainer_id = auth.uid()
    )
  );

create policy "workout_exercises_delete"
  on public.workout_exercises for delete
  using (
    exists (
      select 1
      from public.workout_sections ws
      join public.workouts w on w.id = ws.workout_id
      where ws.id = workout_exercises.section_id
        and w.trainer_id = auth.uid()
    )
  );

-- ============================================================
-- WORKOUT_TEMPLATES
-- ============================================================
create policy "templates_select"
  on public.workout_templates for select
  using (trainer_id = auth.uid());

create policy "templates_insert"
  on public.workout_templates for insert
  with check (trainer_id = auth.uid());

create policy "templates_update"
  on public.workout_templates for update
  using (trainer_id = auth.uid());

create policy "templates_delete"
  on public.workout_templates for delete
  using (trainer_id = auth.uid());

-- ============================================================
-- WORKOUT_TEMPLATE_SECTIONS
-- ============================================================
create policy "wts_all"
  on public.workout_template_sections for all
  using (
    exists (
      select 1 from public.workout_templates t
      where t.id = workout_template_sections.template_id
        and t.trainer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_templates t
      where t.id = workout_template_sections.template_id
        and t.trainer_id = auth.uid()
    )
  );

-- ============================================================
-- WORKOUT_TEMPLATE_EXERCISES
-- ============================================================
create policy "wte_all"
  on public.workout_template_exercises for all
  using (
    exists (
      select 1
      from public.workout_template_sections wts
      join public.workout_templates t on t.id = wts.template_id
      where wts.id = workout_template_exercises.section_id
        and t.trainer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workout_template_sections wts
      join public.workout_templates t on t.id = wts.template_id
      where wts.id = workout_template_exercises.section_id
        and t.trainer_id = auth.uid()
    )
  );

-- ============================================================
-- ASSESSMENTS
-- ============================================================
create policy "assessments_select_trainer"
  on public.assessments for select
  using (trainer_id = auth.uid());

create policy "assessments_insert_trainer"
  on public.assessments for insert
  with check (trainer_id = auth.uid());

create policy "assessments_update_trainer"
  on public.assessments for update
  using (trainer_id = auth.uid());

create policy "assessments_delete_trainer"
  on public.assessments for delete
  using (trainer_id = auth.uid());

create policy "assessments_select_portal"
  on public.assessments for select
  using (
    exists (
      select 1 from public.students s
      where s.id = assessments.student_id
        and s.portal_user_id = auth.uid()
    )
  );

-- ============================================================
-- PROGRESS_PHOTOS
-- ============================================================
create policy "progress_photos_trainer"
  on public.progress_photos for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "progress_photos_portal"
  on public.progress_photos for select
  using (
    exists (
      select 1 from public.students s
      where s.id = progress_photos.student_id
        and s.portal_user_id = auth.uid()
    )
  );

-- ============================================================
-- STUDENT_FILES
-- ============================================================
create policy "student_files_trainer"
  on public.student_files for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "student_files_portal"
  on public.student_files for select
  using (
    exists (
      select 1 from public.students s
      where s.id = student_files.student_id
        and s.portal_user_id = auth.uid()
    )
  );
