-- =============================================================================
-- CheckJai — คัดลอกทั้งไฟล์ไปที่ Supabase → SQL Editor → New query → วาง → Run (ครั้งเดียว)
-- ครอบคลุม: นักศึกษา (users + login_user), การส่งแบบ (assessment_submissions),
--           อาจารย์ (teachers + login_teacher), โปรไฟล์นักศึกษา + มุมมอง Search
-- รันซ้ำได้โดยส่วนใหญ่จะ upsert / drop+create ตามที่ระบุ
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extension
-- -----------------------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- นักศึกษา: ตาราง users + ฟังก์ชัน login_user
-- -----------------------------------------------------------------------------
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

insert into public.users (student_id, password)
values (
  '6452100963',
  crypt('123456789', gen_salt('bf'))
)
on conflict (student_id) do update
set password = excluded.password;

-- -----------------------------------------------------------------------------
-- การทำแบบทดสอบ EQ + DASS-21 (insert จาก API นักศึกษา)
-- -----------------------------------------------------------------------------
create table if not exists public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id text,
  created_at timestamptz not null default now(),

  eq_answers jsonb not null,
  eq_total_score int not null,

  dass_answers jsonb not null,
  dass_depression jsonb not null,
  dass_anxiety jsonb not null,
  dass_stress jsonb not null
);

create index if not exists assessment_submissions_student_id_idx
  on public.assessment_submissions (student_id);

create index if not exists assessment_submissions_created_at_idx
  on public.assessment_submissions (created_at desc);

alter table public.assessment_submissions enable row level security;

drop policy if exists "assessment_insert_anon" on public.assessment_submissions;
drop policy if exists "assessment_no_select_anon" on public.assessment_submissions;

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

-- -----------------------------------------------------------------------------
-- อาจารย์: teachers + login_teacher (+ บัญชีทดสอบ teacher / teacher123)
-- -----------------------------------------------------------------------------
create table if not exists public.teachers (
  username text primary key,
  password text not null
);

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

insert into public.teachers (username, password)
values (
  'teacher',
  crypt('teacher123', gen_salt('bf'))
)
on conflict (username) do update
set password = excluded.password;

-- -----------------------------------------------------------------------------
-- โปรไฟล์นักศึกษา (ชื่อ–คณะ–สาขา–ชั้นปี / ให้ผู้ดูแลเพิ่มในอนาคตได้จาก SQL )
-- -----------------------------------------------------------------------------
create table if not exists public.student_profiles (
  student_id text primary key,
  full_name text,
  faculty text,
  major text,
  year_level int
);

comment on table public.student_profiles is 'ข้อมูลแสดงผลในหน้า Search อาจารย์ — join กับ assessment_submissions ด้วย student_id';

alter table public.student_profiles enable row level security;

drop policy if exists "student_profiles_no_direct" on public.student_profiles;
create policy "student_profiles_no_direct"
  on public.student_profiles
  for all
  to anon, authenticated
  using (false)
  with check (false);

insert into public.student_profiles (student_id, full_name, faculty, major, year_level)
values ('6452100963', 'ผู้ใช้ตัวอย่าง CheckJai', 'คณะตัวอย่าง', 'สาขาตัวอย่าง', 2)
on conflict (student_id) do update
set full_name = excluded.full_name,
    faculty = excluded.faculty,
    major = excluded.major,
    year_level = excluded.year_level;

-- -----------------------------------------------------------------------------
-- มุมมองรวมสำหรับ API อาจารย์ (อ่านด้วย service role)
-- -----------------------------------------------------------------------------
drop view if exists public.v_assessment_student_list;

create view public.v_assessment_student_list as
select
  s.id,
  s.student_id,
  s.created_at,
  s.eq_total_score,
  p.full_name,
  p.faculty,
  p.major,
  p.year_level
from public.assessment_submissions s
left join public.student_profiles p on p.student_id = s.student_id;

comment on view public.v_assessment_student_list is 'ประวัติการทำแบบ + ข้อมูลนักศึกษา (ถ้ามีใน student_profiles)';

-- พร้อมใช้: แก้ .env และรัน npm run dev ในโฟลเดอร์ checkjai
--   ทดสอบนักศึกษา: 6452100963 / 123456789
--   ทดสอบอาจารย์: teacher / teacher123 ที่ /admin/login
-- =============================================================================
