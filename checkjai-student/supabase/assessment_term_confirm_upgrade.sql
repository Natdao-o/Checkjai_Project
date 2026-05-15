-- อัปเกรดระบบเก็บผล: เก็บ "ล่าสุดต่อเทอม" และยืนยันคงถาวรโดยอาจารย์
-- รันหลังจากมีตาราง public.assessment_submissions อยู่แล้ว

alter table public.assessment_submissions
  add column if not exists term_key text not null default '',
  add column if not exists is_confirmed boolean not null default false,
  add column if not exists confirmed_at timestamptz,
  add column if not exists confirmed_by text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists assessment_submissions_term_idx
  on public.assessment_submissions (term_key, is_confirmed);

-- ลบ partial unique เดิม (ถ้ามี) เพราะใช้กับ upsert onConflict(student_id,term_key,is_confirmed) ไม่ได้
drop index if exists public.assessment_submissions_student_term_draft_uniq;

-- กันข้อมูลซ้ำก่อนสร้าง unique แบบเต็มคีย์
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

-- unique เต็มคีย์: ต่อคน ต่อเทอม ต่อสถานะ (draft/confirmed) มีได้อย่างละ 1 แถว
create unique index if not exists assessment_submissions_student_term_state_uniq
  on public.assessment_submissions (student_id, term_key, is_confirmed);

-- ช่วยให้ข้อมูลเก่าใช้งานต่อได้: ถ้ายังว่าง term_key ให้เติมด้วยเทอมปัจจุบันแบบง่าย
update public.assessment_submissions
set term_key = to_char(now(), 'YYYY') || '-T' ||
  case
    when extract(month from now()) between 6 and 10 then '1'
    else '2'
  end
where coalesce(term_key, '') = '';

-- RPC เดียวสำหรับบันทึกแบบทดสอบ (เร็วกว่าการเช็ค + upsert แยกหลาย query)
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
