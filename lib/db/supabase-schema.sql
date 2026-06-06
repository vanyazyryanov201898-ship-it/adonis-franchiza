-- ============================================================
-- ADONIS AI Platform — Supabase Schema v2
-- Выполни в Supabase: SQL Editor → New Query → Run All
-- ============================================================

-- Удаляем старые таблицы если есть (CASCADE удалит зависимости)
drop table if exists scheduled_posts  cascade;
drop table if exists video_queue      cascade;
drop table if exists leads            cascade;
drop table if exists generated_content cascade;
drop table if exists brand_settings   cascade;
drop table if exists profiles         cascade;

-- 1. Профили пользователей (создаётся автоматически при регистрации)
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  company     text,
  role        text default 'partner',
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Автоматически создаём профиль при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Сгенерированный контент
create table if not exists generated_content (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  type         text not null,
  topic        text not null,
  platform     text not null,
  tone         text not null default 'Доверительный',
  content      text not null,
  viral_score  int  not null default 85,
  carousel_data jsonb,
  created_at   timestamptz default now()
);

-- 3. Лиды (заявки на франшизу)
create table if not exists leads (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  name         text,
  phone        text,
  email        text,
  platform     text not null default 'Unknown',
  source_video text,
  status       text not null default 'new'
                 check (status in ('new','contacted','qualified','closed')),
  notes        text,
  created_at   timestamptz default now()
);

-- 4. Очередь видео
create table if not exists video_queue (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  title        text not null,
  status       text not null default 'queued'
                 check (status in ('queued','rendering','completed','failed')),
  progress     int  not null default 0,
  platforms    text[] not null default '{}',
  viral_score  int  not null default 85,
  duration     text,
  content_id   uuid references generated_content(id) on delete set null,
  created_at   timestamptz default now()
);

-- 5. Расписание публикаций
create table if not exists scheduled_posts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  title        text not null,
  platform     text not null,
  scheduled_at timestamptz not null,
  status       text not null default 'scheduled'
                 check (status in ('scheduled','processing','published','draft')),
  video_id     uuid references video_queue(id) on delete set null,
  created_at   timestamptz default now()
);

-- 6. Генерации видео (Higgsfield)
create table if not exists video_generations (
  id           uuid primary key default gen_random_uuid(),
  direction    text not null,
  topic        text,
  prompt       text not null,
  model        text not null,
  duration_sec int  not null default 5,
  higgs_id     text,
  status       text not null default 'queued'
                 check (status in ('queued','processing','completed','failed')),
  video_url    text,
  credits_used int,
  created_at   timestamptz default now(),
  completed_at timestamptz
);

alter table video_generations enable row level security;
create policy "public insert" on video_generations for insert with check (true);
create policy "public select" on video_generations for select using (true);
create policy "public update" on video_generations for update using (true);

-- 7. Настройки бренда
create table if not exists brand_settings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade unique,
  brand_name    text default 'ADONIS',
  tagline       text,
  colors        jsonb,
  voice_profile jsonb,
  logo_images   jsonb,
  updated_at    timestamptz default now()
);

-- ─── Row Level Security ──────────────────────────────────────
alter table profiles         enable row level security;
alter table generated_content enable row level security;
alter table leads             enable row level security;
alter table video_queue       enable row level security;
alter table scheduled_posts   enable row level security;
alter table brand_settings    enable row level security;

-- Каждый видит только своё
create policy "own data" on profiles
  for all using (auth.uid() = id);

create policy "own data" on generated_content
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own data" on leads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own data" on video_queue
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own data" on scheduled_posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own data" on brand_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
