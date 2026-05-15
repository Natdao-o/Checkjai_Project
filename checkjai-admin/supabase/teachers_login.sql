-- ตารางอาจารย์ / แอดมิน — แยกจาก public.users (นักศึกษา)
-- นโยบายใช้งาน: บัญชีอาจารย์ไม่ได้ลงทะเบียนเอง ให้เฉพาะผู้ดูแลระบบเพิ่มแถวใน
--   public.teachers ผ่าน SQL / Dashboard โดย password ต้องเป็น hash bcrypt (เช่น crypt('รหัส', gen_salt('bf'))).
-- รันใน Supabase SQL Editor หลังมี extension pgcrypto แล้ว (ดู full_login_setup.sql)
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

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

-- บัญชีทดสอบครั้งแรก: username teacher / password teacher123
-- หลังใช้งานจริงควรเปลี่ยนรหัส (update) หรือให้ผู้ดูแลเพิ่มบัญชีใหม่แล้วลบ/แก้ไขแถวนี้
insert into public.teachers (username, password)
values (
  'teacher',
  crypt('teacher123', gen_salt('bf'))
)
on conflict (username) do update
set password = excluded.password;
