-- ข้อมูลนักศึกษาสำหรับค้นหา/แสดงในระบบอาจารย์ (แยกจาก users ซึ่งเก็บแค่รหัสล็อกอิน)
-- ให้ผู้ดูแล pop ตารางนี้ให้ตรง student_id กับ users.student_id เมื่อต้องการแสดงชื่อ–คณะ–สาขา–ชั้นปี
-- รันหลังมี public.users และ public.assessment_submissions

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

-- มุมมองสำหรับฝั่ง API (ใช้กับ service role)
create or replace view public.v_assessment_student_list as
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

comment on view public.v_assessment_student_list is 'ประวัติการทำแบบ + ข้อมูลนักศึกษา (ถ้ามีใน student_profiles)';
