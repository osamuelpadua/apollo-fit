-- ============================================================
-- APOLO FIT — Storage Buckets & Policies
-- Run AFTER 001_schema.sql and 002_rls.sql
-- ============================================================

-- Create buckets (all private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',       'avatars',       false, 5242880,   array['image/jpeg','image/png','image/webp']),
  ('exercises',     'exercises',     false, 10485760,  array['image/jpeg','image/png','image/webp','image/gif']),
  ('progress',      'progress',      false, 10485760,  array['image/jpeg','image/png','image/webp']),
  ('student-files', 'student-files', false, 52428800,  null),
  ('pdfs',          'pdfs',          false, 10485760,  array['application/pdf'])
on conflict (id) do nothing;

-- ============================================================
-- AVATARS bucket
-- Path convention: {user_id}/avatar.webp
-- ============================================================
create policy "avatars_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_select"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trainers can also read their students' avatars (for display)
create policy "avatars_select_trainer_for_students"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and exists (
      select 1 from public.students s
      where s.trainer_id = auth.uid()
        and s.portal_user_id::text = (storage.foldername(name))[1]
    )
  );

-- ============================================================
-- EXERCISES bucket
-- Path convention: {trainer_id}/{exercise_id}/image.webp
-- ============================================================
create policy "exercises_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'exercises'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "exercises_select"
  on storage.objects for select
  using (
    bucket_id = 'exercises'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1 from public.exercises e
        where e.is_global = true
          and e.image_url like '%' || name || '%'
      )
    )
  );

create policy "exercises_update"
  on storage.objects for update
  using (
    bucket_id = 'exercises'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "exercises_delete"
  on storage.objects for delete
  using (
    bucket_id = 'exercises'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- PROGRESS bucket
-- Path convention: {trainer_id}/{student_id}/{date}_{angle}.webp
-- ============================================================
create policy "progress_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'progress'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "progress_select"
  on storage.objects for select
  using (
    bucket_id = 'progress'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1 from public.students s
        where s.id::text = (storage.foldername(name))[2]
          and s.portal_user_id = auth.uid()
      )
    )
  );

create policy "progress_update"
  on storage.objects for update
  using (
    bucket_id = 'progress'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "progress_delete"
  on storage.objects for delete
  using (
    bucket_id = 'progress'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- STUDENT-FILES bucket
-- Path convention: {trainer_id}/{student_id}/{uuid}_{filename}
-- ============================================================
create policy "student_files_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'student-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "student_files_select"
  on storage.objects for select
  using (
    bucket_id = 'student-files'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1 from public.students s
        where s.id::text = (storage.foldername(name))[2]
          and s.portal_user_id = auth.uid()
      )
    )
  );

create policy "student_files_delete"
  on storage.objects for delete
  using (
    bucket_id = 'student-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- PDFS bucket
-- Path convention: {trainer_id}/{workout_id}.pdf
-- ============================================================
create policy "pdfs_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "pdfs_select"
  on storage.objects for select
  using (
    bucket_id = 'pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "pdfs_delete"
  on storage.objects for delete
  using (
    bucket_id = 'pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
