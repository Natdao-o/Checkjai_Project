-- =============================================================================
-- คัดลอกทั้งไฟล์นี้ → Supabase → SQL Editor → New query → วาง → Run (ครั้งเดียว)
-- หลังรันสำเร็จ: ล็อกอินที่เว็บด้วย student_id + รหัสผ่าน plain (เว็บส่งให้ API ตรวจกับ bcrypt)
-- =============================================================================

-- 1) ต้องมี pgcrypto (bcrypt) — บน Supabase อยู่ schema extensions
create extension if not exists pgcrypto with schema extensions;

-- 2) ถ้าเคยสร้างตารางชื่อ student ไว้ เปลี่ยนชื่อเป็น users
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

-- 3) ตาราง users: ชื่อผู้ใช้ = student_id | คอลัมน์ password = เก็บเฉพาะ hash จาก crypt()
create table if not exists public.users (
  student_id text primary key,
  password text not null
);

-- 4) แปลงรหัส plain text เก่า (สั้นกว่า 60 ตัว) เป็น bcrypt อัตโนมัติ (รอบเดียว)
update public.users u
set password = crypt(u.password::text, gen_salt('bf'))
where length(u.password) < 60;

alter table public.users enable row level security;

-- 5) ไม่ให้ client อ่านตารางตรง (ล็อกอินผ่านฟังก์ชัน login_user เท่านั้น)
drop policy if exists "users_no_direct_read" on public.users;
drop policy if exists "student_no_direct_read" on public.users;
create policy "users_no_direct_read"
  on public.users
  for select
  to anon, authenticated
  using (false);

-- 6) ฟังก์ชันล็อกอิน (แอปเรียกชื่อ login_user)
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

-- 7) ผู้ใช้ตัวอย่าง — แก้ student_id / รหัสผ่านได้ หรือลบทั้งบล็อกถ้าไม่ต้องการ
insert into public.users (student_id, password)
values (
  '6452100963',
  crypt('123456789', gen_salt('bf'))
)
on conflict (student_id) do update
set password = excluded.password;
