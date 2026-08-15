-- Apolo Fit: treinos entregues como imagem, alternativa ao montador de exercícios.

-- 'builder' = seções + exercícios estruturados (comportamento atual)
-- 'image'   = o treino é a(s) imagem(ns) enviada(s) pelo personal
alter table public.workouts
  add column if not exists source_type text not null default 'builder'
  check (source_type in ('builder', 'image'));

create table if not exists public.workout_images (
  id           uuid primary key default uuid_generate_v4(),
  workout_id   uuid not null references public.workouts(id) on delete cascade,
  trainer_id   uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  caption      text,
  sort_order   integer not null default 0,
  file_size    bigint,
  mime_type    text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_workout_images_workout_id
  on public.workout_images(workout_id, sort_order);

alter table public.workout_images enable row level security;

-- O personal só manipula imagens de treinos que são dele.
drop policy if exists "workout_images_trainer" on public.workout_images;
create policy "workout_images_trainer"
  on public.workout_images for all
  to authenticated
  using (
    trainer_id = (select auth.uid())
    and exists (
      select 1 from public.workouts w
      where w.id = workout_images.workout_id
        and w.trainer_id = (select auth.uid())
    )
  )
  with check (
    trainer_id = (select auth.uid())
    and exists (
      select 1 from public.workouts w
      where w.id = workout_images.workout_id
        and w.trainer_id = (select auth.uid())
    )
  );

-- O aluno lê apenas as imagens dos próprios treinos.
drop policy if exists "workout_images_select_portal" on public.workout_images;
create policy "workout_images_select_portal"
  on public.workout_images for select
  to authenticated
  using (
    exists (
      select 1
      from public.workouts w
      join public.students s on s.id = w.student_id
      where w.id = workout_images.workout_id
        and s.portal_user_id = (select auth.uid())
    )
  );

-- ============================================================
-- STORAGE — bucket workout-images
-- Convenção de path: {trainer_id}/{student_id}/{workout_id}/{uuid}.{ext}
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workout-images', 'workout-images', false, 15728640,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do nothing;

drop policy if exists "workout_images_upload" on storage.objects;
drop policy if exists "workout_images_select" on storage.objects;
drop policy if exists "workout_images_delete" on storage.objects;

create policy "workout_images_upload" on storage.objects for insert to authenticated
with check (
  bucket_id = 'workout-images'
  and exists (
    select 1 from public.students s
    where s.id::text = (storage.foldername(name))[2]
      and s.trainer_id = (select auth.uid())
      and s.trainer_id::text = (storage.foldername(name))[1]
  )
);

create policy "workout_images_select" on storage.objects for select to authenticated
using (
  bucket_id = 'workout-images'
  and exists (
    select 1 from public.students s
    where s.id::text = (storage.foldername(name))[2]
      and s.trainer_id::text = (storage.foldername(name))[1]
      and (s.trainer_id = (select auth.uid()) or s.portal_user_id = (select auth.uid()))
  )
);

create policy "workout_images_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'workout-images'
  and exists (
    select 1 from public.students s
    where s.id::text = (storage.foldername(name))[2]
      and s.trainer_id = (select auth.uid())
      and s.trainer_id::text = (storage.foldername(name))[1]
  )
);
