-- ============================================================
-- ADONIS AI Platform — Supabase Schema
-- Выполни этот SQL в Supabase: SQL Editor → New Query → Run
-- ============================================================

-- 1. Сгенерированный контент
create table if not exists generated_content (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('scenario','hook','cta','title','description','ideas')),
  topic         text not null,
  platform      text not null,
  tone          text not null default 'Доверительный',
  content       text not null,
  viral_score   int  not null default 85,
  created_at    timestamptz default now()
);

-- 2. Лиды (заявки на франшизу)
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  phone         text,
  platform      text not null default 'Unknown',
  source_video  text,
  status        text not null default 'new'
                  check (status in ('new','contacted','qualified','closed')),
  notes         text,
  created_at    timestamptz default now()
);

-- 3. Очередь видео
create table if not exists video_queue (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  status        text not null default 'queued'
                  check (status in ('queued','rendering','completed','failed')),
  progress      int  not null default 0,
  platforms     text[] not null default '{}',
  viral_score   int  not null default 85,
  duration      text,
  content_id    uuid references generated_content(id) on delete set null,
  created_at    timestamptz default now()
);

-- 4. Расписание публикаций
create table if not exists scheduled_posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  platform      text not null,
  scheduled_at  timestamptz not null,
  status        text not null default 'scheduled'
                  check (status in ('scheduled','processing','published','draft')),
  video_id      uuid references video_queue(id) on delete set null,
  created_at    timestamptz default now()
);

-- ─── Включаем Row Level Security ────────────────────────────
alter table generated_content  enable row level security;
alter table leads               enable row level security;
alter table video_queue         enable row level security;
alter table scheduled_posts     enable row level security;

-- ─── Политики: разрешаем всё (упростим для старта) ──────────
create policy "allow all" on generated_content  for all using (true) with check (true);
create policy "allow all" on leads               for all using (true) with check (true);
create policy "allow all" on video_queue         for all using (true) with check (true);
create policy "allow all" on scheduled_posts     for all using (true) with check (true);

-- ─── Тестовые данные (лиды) ─────────────────────────────────
insert into leads (name, platform, source_video, status) values
  ('Дмитрий К.', 'TikTok',    'Уход из найма — мой опыт',   'new'),
  ('Анна М.',    'Instagram',  'Сколько стоит франшиза',      'contacted'),
  ('Сергей В.',  'YouTube',    'Бизнес на печати с нуля',     'qualified'),
  ('Иван Л.',    'TikTok',    'Первые 500К — мой путь',       'new'),
  ('Марина Р.',  'Instagram',  'Партнёр ADONIS: год спустя',  'new');
