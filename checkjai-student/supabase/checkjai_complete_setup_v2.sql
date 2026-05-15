-- =============================================================================
-- CheckJai Complete Setup (v2)
-- วางทั้งหมดใน Supabase SQL Editor แล้ว Run ครั้งเดียว
-- ใช้ได้ทั้งติดตั้งใหม่ และรันซ้ำเพื่ออัปเกรดโครงสร้างเดิม
--
-- ครอบคลุม:
-- 1) นักศึกษา login_user
-- 2) อาจารย์ login_teacher
-- 3) assessment_submissions (term + confirm flow)
-- 4) student_profiles + view สำหรับหน้า Search/Admin
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- users (นักศึกษา) + login_user
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_tables where schemaname = 'public' and tablename = 'student'
  ) and not exists (
    select 1 from pg_tables where schemaname = 'public' and tablename = 'users'
  ) then
    alter table public.student rename to users;
  end if;
end $$;

create table if not exists public.users (
  student_id text primary key,
  password text not null
);

-- migrate plain text -> bcrypt (ถ้ามีข้อมูลเก่า)
update public.users u
set password = crypt(u.password::text, gen_salt('bf'))
where length(u.password) < 60;

alter table public.users enable row level security;

drop policy if exists "users_no_direct_read" on public.users;
drop policy if exists "student_no_direct_read" on public.users;
create policy "users_no_direct_read"
  on public.users
  for select
  to anon, authenticated
  using (false);

drop function if exists public.login_student(text, text);
drop function if exists public.login_user(text, text);

create or replace function public.login_user(p_student_id text, p_password text)
returns table (student_id text)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select u.student_id::text
  from public.users u
  where u.student_id::text = p_student_id
    and u.password = crypt(p_password, u.password);
end;
$$;

revoke all on function public.login_user(text, text) from public;
grant execute on function public.login_user(text, text) to anon;
grant execute on function public.login_user(text, text) to authenticated;

-- ตัวอย่างนักศึกษา
insert into public.users (student_id, password)
values (
  '6452100963',
  crypt('123456789', gen_salt('bf'))
)
on conflict (student_id) do update
set password = excluded.password;

-- ---------------------------------------------------------------------------
-- teachers (อาจารย์) + login_teacher
-- ---------------------------------------------------------------------------
create table if not exists public.teachers (
  username text primary key,
  password text not null
);

-- migrate plain text -> bcrypt (ถ้ามีข้อมูลเก่า)
update public.teachers t
set password = crypt(t.password::text, gen_salt('bf'))
where length(t.password) < 60;

alter table public.teachers enable row level security;

drop policy if exists "teachers_no_direct_read" on public.teachers;
create policy "teachers_no_direct_read"
  on public.teachers
  for select
  to anon, authenticated
  using (false);

drop function if exists public.login_teacher(text, text);

create or replace function public.login_teacher(p_username text, p_password text)
returns table (username text)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select t.username::text
  from public.teachers t
  where t.username::text = p_username
    and t.password = crypt(p_password, t.password);
end;
$$;

revoke all on function public.login_teacher(text, text) from public;
grant execute on function public.login_teacher(text, text) to anon;
grant execute on function public.login_teacher(text, text) to authenticated;

-- ตัวอย่างอาจารย์
insert into public.teachers (username, password)
values (
  'teacher',
  crypt('teacher123', gen_salt('bf'))
)
on conflict (username) do update
set password = excluded.password;

-- ---------------------------------------------------------------------------
-- assessment_submissions
-- เก็บผล EQ+DASS ต่อคนต่อเทอม
-- - draft (is_confirmed=false): เขียนทับได้เสมอ ต่อคนต่อเทอม 1 แถว
-- - confirmed (is_confirmed=true): คงถาวร ไม่ให้ทับ
-- ---------------------------------------------------------------------------
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

alter table public.assessment_submissions enable row level security;

drop policy if exists "assessment_insert_anon" on public.assessment_submissions;
drop policy if exists "assessment_no_select_anon" on public.assessment_submissions;
drop policy if exists "assessment_update_unconfirmed_anon" on public.assessment_submissions;

-- student API insert ได้
create policy "assessment_insert_anon"
  on public.assessment_submissions
  for insert
  to anon, authenticated
  with check (true);

-- student API upsert (DO UPDATE) เฉพาะ draft ที่ยังไม่ confirm
create policy "assessment_update_unconfirmed_anon"
  on public.assessment_submissions
  for update
  to anon, authenticated
  using (is_confirmed = false)
  with check (is_confirmed = false);

-- client อ่านตรงไม่ได้
create policy "assessment_no_select_anon"
  on public.assessment_submissions
  for select
  to anon, authenticated
  using (false);

-- อัปเดต term_key ให้ข้อมูลเดิมที่ว่าง (ถ้ามี)
update public.assessment_submissions
set term_key = to_char(now(), 'YYYY') || '-T' ||
  case
    when extract(month from now()) between 6 and 10 then '1'
    else '2'
  end
where coalesce(term_key, '') = '';

-- ลบ partial unique เดิม (ถ้ามี)
drop index if exists public.assessment_submissions_student_term_draft_uniq;

-- dedupe ก่อนสร้าง unique (กันชนกรณีมีข้อมูลเก่าซ้ำ)
with ranked as (
  select
    id,
    row_number() over (
      partition by student_id, term_key, is_confirmed
      order by coalesce(updated_at, created_at) desc, created_at desc, id desc
    ) as rn
  from public.assessment_submissions
)
delete from public.assessment_submissions s
using ranked r
where s.id = r.id
  and r.rn > 1;

-- unique สำคัญสำหรับ upsert onConflict(student_id,term_key,is_confirmed)
create unique index if not exists assessment_submissions_student_term_state_uniq
  on public.assessment_submissions (student_id, term_key, is_confirmed);

drop function if exists public.save_assessment_submission(text, text, jsonb, int, jsonb, jsonb, jsonb, jsonb);

create or replace function public.save_assessment_submission(
  p_student_id text,
  p_term_key text,
  p_eq_answers jsonb,
  p_eq_total_score int,
  p_dass_answers jsonb,
  p_dass_depression jsonb,
  p_dass_anxiety jsonb,
  p_dass_stress jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
begin
  if exists (
    select 1
    from public.assessment_submissions s
    where s.student_id = p_student_id
      and s.term_key = p_term_key
      and s.is_confirmed = true
  ) then
    raise exception 'TERM_CONFIRMED:%', p_term_key using errcode = 'P0001';
  end if;

  insert into public.assessment_submissions (
    student_id,
    term_key,
    is_confirmed,
    created_at,
    updated_at,
    eq_answers,
    eq_total_score,
    dass_answers,
    dass_depression,
    dass_anxiety,
    dass_stress
  )
  values (
    p_student_id,
    p_term_key,
    false,
    now(),
    now(),
    p_eq_answers,
    p_eq_total_score,
    p_dass_answers,
    p_dass_depression,
    p_dass_anxiety,
    p_dass_stress
  )
  on conflict (student_id, term_key, is_confirmed)
  do update set
    created_at = now(),
    updated_at = now(),
    eq_answers = excluded.eq_answers,
    eq_total_score = excluded.eq_total_score,
    dass_answers = excluded.dass_answers,
    dass_depression = excluded.dass_depression,
    dass_anxiety = excluded.dass_anxiety,
    dass_stress = excluded.dass_stress
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.save_assessment_submission(text, text, jsonb, int, jsonb, jsonb, jsonb, jsonb) from public;
grant execute on function public.save_assessment_submission(text, text, jsonb, int, jsonb, jsonb, jsonb, jsonb) to anon;
grant execute on function public.save_assessment_submission(text, text, jsonb, int, jsonb, jsonb, jsonb, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- student_profiles (ข้อมูลแสดงผลอาจารย์)
-- ---------------------------------------------------------------------------
create table if not exists public.student_profiles (
  student_id text primary key,
  full_name text,
  faculty text,
  major text,
  year_level int
);

comment on table public.student_profiles is
  'ข้อมูลแสดงผลหน้า Search อาจารย์ — join กับ assessment_submissions ด้วย student_id';

alter table public.student_profiles enable row level security;

drop policy if exists "student_profiles_no_direct" on public.student_profiles;
create policy "student_profiles_no_direct"
  on public.student_profiles
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ตัวอย่าง profile นักศึกษา
insert into public.student_profiles (student_id, full_name, faculty, major, year_level)
values (
  '6452100963',
  'ผู้ใช้ตัวอย่าง CheckJai',
  'คณะตัวอย่าง',
  'สาขาตัวอย่าง',
  2
)
on conflict (student_id) do update
set
  full_name = excluded.full_name,
  faculty = excluded.faculty,
  major = excluded.major,
  year_level = excluded.year_level;

-- ---------------------------------------------------------------------------
-- View สำหรับหน้า admin
-- ---------------------------------------------------------------------------
drop view if exists public.v_assessment_student_list;

create view public.v_assessment_student_list as
select
  s.id,
  s.student_id,
  s.term_key,
  s.is_confirmed,
  s.confirmed_at,
  s.confirmed_by,
  s.created_at,
  s.eq_total_score,
  p.full_name,
  p.faculty,
  p.major,
  p.year_level
from public.assessment_submissions s
left join public.student_profiles p on p.student_id = s.student_id;

comment on view public.v_assessment_student_list is
  'ประวัติการทำแบบ + ข้อมูลนักศึกษา + เทอม/สถานะยืนยัน';

-- =============================================================================
-- เสร็จแล้วให้รีสตาร์ท API (npm run dev ใหม่)
-- ทดสอบ:
--   นักศึกษา: 6452100963 / 123456789
--   อาจารย์ : teacher / teacher123
-- =============================================================================
