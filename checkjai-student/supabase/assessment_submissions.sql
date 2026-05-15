-- รันใน Supabase SQL Editor
-- บันทึกผลทั้งสองแบบทดสอบ (EQ + DASS-21) หลังผู้ใช้ทำครบ

create table if not exists public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id text,
  term_key text not null default '',
  is_confirmed boolean not null default false,
  confirmed_at timestamptz,
  confirmed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  eq_answers jsonb not null,
  eq_total_score int not null,

  dass_answers jsonb not null,
  dass_depression jsonb not null,
  dass_anxiety jsonb not null,
  dass_stress jsonb not null
);

create index if not exists assessment_submissions_student_id_idx
  on public.assessment_submissions (student_id);
create index if not exists assessment_submissions_term_idx
  on public.assessment_submissions (term_key, is_confirmed);

create index if not exists assessment_submissions_created_at_idx
  on public.assessment_submissions (created_at desc);

create unique index if not exists assessment_submissions_student_term_state_uniq
  on public.assessment_submissions (student_id, term_key, is_confirmed);

alter table public.assessment_submissions enable row level security;

drop policy if exists "assessment_insert_anon" on public.assessment_submissions;
drop policy if exists "assessment_no_select_anon" on public.assessment_submissions;

-- ฝั่ง API (anon key) บันทึกได้ — ยังไม่เปิดอ่านจาก client
create policy "assessment_insert_anon"
  on public.assessment_submissions
  for insert
  to anon, authenticated
  with check (true);

create policy "assessment_no_select_anon"
  on public.assessment_submissions
  for select
  to anon, authenticated
  using (false);
