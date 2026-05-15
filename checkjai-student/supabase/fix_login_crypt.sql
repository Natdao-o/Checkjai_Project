-- แก้ crypt / อัปเดตมาใช้ตาราง users + ฟังก์ชัน login_user
create extension if not exists pgcrypto with schema extensions;

drop function if exists public.login_student(text, text);

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
