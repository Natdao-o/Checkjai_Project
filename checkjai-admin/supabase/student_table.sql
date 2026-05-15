-- เหมือน full_login_setup.sql — คัดลอกไปรันใน Supabase SQL Editor ได้ทั้งไฟล์
-- (ไฟล์หลักที่อ่านง่าย: supabase/full_login_setup.sql)

-- =============================================================================
-- คัดลอกทั้งไฟล์นี้ → Supabase → SQL Editor → New query → วาง → Run (ครั้งเดียว)
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

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
