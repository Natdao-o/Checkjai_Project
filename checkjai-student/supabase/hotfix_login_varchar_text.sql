-- แก้ error: structure of query does not match function result type (varchar vs text)
-- รันใน SQL Editor ครั้งเดียว

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
