-- Apolo Fit: server-owned roles and tenant-safe portal access.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    case
      when new.raw_app_meta_data ->> 'app_role' in ('trainer', 'student')
        then (new.raw_app_meta_data ->> 'app_role')::text
      else 'student'
    end,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

-- Users may edit presentation fields, never their own role.
revoke update on table public.profiles from authenticated;
grant update (full_name, email, avatar_url, updated_at)
  on table public.profiles to authenticated;

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- The portal link is controlled only by server actions using the service role.
revoke update on table public.students from authenticated;
grant update (
  full_name, email, phone, date_of_birth, gender, goal, notes,
  avatar_url, is_active, updated_at
) on table public.students to authenticated;

drop policy if exists "students_update_trainer" on public.students;
create policy "students_update_trainer"
  on public.students for update
  to authenticated
  using (trainer_id = (select auth.uid()))
  with check (trainer_id = (select auth.uid()));

-- A trainer cannot attach records to a student owned by another trainer.
drop policy if exists "workouts_insert_trainer" on public.workouts;
create policy "workouts_insert_trainer"
  on public.workouts for insert
  to authenticated
  with check (
    trainer_id = (select auth.uid())
    and exists (
      select 1 from public.students s
      where s.id = workouts.student_id
        and s.trainer_id = (select auth.uid())
    )
  );

drop policy if exists "workouts_update_trainer" on public.workouts;
create policy "workouts_update_trainer"
  on public.workouts for update
  to authenticated
  using (trainer_id = (select auth.uid()))
  with check (
    trainer_id = (select auth.uid())
    and exists (
      select 1 from public.students s
      where s.id = workouts.student_id
        and s.trainer_id = (select auth.uid())
    )
  );

drop policy if exists "assessments_insert_trainer" on public.assessments;
create policy "assessments_insert_trainer"
  on public.assessments for insert
  to authenticated
  with check (
    trainer_id = (select auth.uid())
    and exists (
      select 1 from public.students s
      where s.id = assessments.student_id
        and s.trainer_id = (select auth.uid())
    )
  );

drop policy if exists "assessments_update_trainer" on public.assessments;
create policy "assessments_update_trainer"
  on public.assessments for update
  to authenticated
  using (trainer_id = (select auth.uid()))
  with check (
    trainer_id = (select auth.uid())
    and exists (
      select 1 from public.students s
      where s.id = assessments.student_id
        and s.trainer_id = (select auth.uid())
    )
  );

drop policy if exists "progress_photos_trainer" on public.progress_photos;
create policy "progress_photos_trainer"
  on public.progress_photos for all
  to authenticated
  using (
    trainer_id = (select auth.uid())
    and exists (
      select 1 from public.students s
      where s.id = progress_photos.student_id
        and s.trainer_id = (select auth.uid())
    )
  )
  with check (
    trainer_id = (select auth.uid())
    and exists (
      select 1 from public.students s
      where s.id = progress_photos.student_id
        and s.trainer_id = (select auth.uid())
    )
  );

drop policy if exists "student_files_trainer" on public.student_files;
create policy "student_files_trainer"
  on public.student_files for all
  to authenticated
  using (
    trainer_id = (select auth.uid())
    and exists (
      select 1 from public.students s
      where s.id = student_files.student_id
        and s.trainer_id = (select auth.uid())
    )
  )
  with check (
    trainer_id = (select auth.uid())
    and exists (
      select 1 from public.students s
      where s.id = student_files.student_id
        and s.trainer_id = (select auth.uid())
    )
  );

-- Students may read custom exercises only when they occur in their own workouts.
drop policy if exists "exercises_select_portal" on public.exercises;
create policy "exercises_select_portal"
  on public.exercises for select
  to authenticated
  using (
    exists (
      select 1
      from public.workout_exercises we
      join public.workout_sections ws on ws.id = we.section_id
      join public.workouts w on w.id = ws.workout_id
      join public.students s on s.id = w.student_id
      where we.exercise_id = exercises.id
        and s.portal_user_id = (select auth.uid())
    )
  );

-- Storage paths must match a student owned by the trainer in the first folder.
drop policy if exists "progress_upload" on storage.objects;
drop policy if exists "progress_select" on storage.objects;
drop policy if exists "progress_update" on storage.objects;
drop policy if exists "progress_delete" on storage.objects;

create policy "progress_upload" on storage.objects for insert to authenticated
with check (
  bucket_id = 'progress'
  and exists (
    select 1 from public.students s
    where s.id::text = (storage.foldername(name))[2]
      and s.trainer_id = (select auth.uid())
      and s.trainer_id::text = (storage.foldername(name))[1]
  )
);
create policy "progress_select" on storage.objects for select to authenticated
using (
  bucket_id = 'progress'
  and exists (
    select 1 from public.students s
    where s.id::text = (storage.foldername(name))[2]
      and s.trainer_id::text = (storage.foldername(name))[1]
      and (s.trainer_id = (select auth.uid()) or s.portal_user_id = (select auth.uid()))
  )
);
create policy "progress_update" on storage.objects for update to authenticated
using (
  bucket_id = 'progress'
  and exists (
    select 1 from public.students s
    where s.id::text = (storage.foldername(name))[2]
      and s.trainer_id = (select auth.uid())
      and s.trainer_id::text = (storage.foldername(name))[1]
  )
);
create policy "progress_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'progress'
  and exists (
    select 1 from public.students s
    where s.id::text = (storage.foldername(name))[2]
      and s.trainer_id = (select auth.uid())
      and s.trainer_id::text = (storage.foldername(name))[1]
  )
);

drop policy if exists "student_files_upload" on storage.objects;
drop policy if exists "student_files_select" on storage.objects;
drop policy if exists "student_files_delete" on storage.objects;

create policy "student_files_upload" on storage.objects for insert to authenticated
with check (
  bucket_id = 'student-files'
  and exists (
    select 1 from public.students s
    where s.id::text = (storage.foldername(name))[2]
      and s.trainer_id = (select auth.uid())
      and s.trainer_id::text = (storage.foldername(name))[1]
  )
);
create policy "student_files_select" on storage.objects for select to authenticated
using (
  bucket_id = 'student-files'
  and exists (
    select 1 from public.students s
    where s.id::text = (storage.foldername(name))[2]
      and s.trainer_id::text = (storage.foldername(name))[1]
      and (s.trainer_id = (select auth.uid()) or s.portal_user_id = (select auth.uid()))
  )
);
create policy "student_files_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'student-files'
  and exists (
    select 1 from public.students s
    where s.id::text = (storage.foldername(name))[2]
      and s.trainer_id = (select auth.uid())
      and s.trainer_id::text = (storage.foldername(name))[1]
  )
);
