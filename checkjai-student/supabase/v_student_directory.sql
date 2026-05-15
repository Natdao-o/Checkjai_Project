-- 1. สร้างฟังก์ชันสำหรับคำนวณ Term Key ปัจจุบันให้เป็นมาตรฐานเดียวกัน
create or replace function public.get_current_term_key()
returns text
language sql
immutable
as $$
  select to_char(now(), 'YYYY') || '-T' ||
    case
      when extract(month from now()) between 6 and 10 then '1'
      else '2'
    end;
$$;

-- 2. สร้าง View สำหรับ Student Directory เพื่อแสดงสถานะ Done/Pending ของเทอมปัจจุบัน
drop view if exists public.v_student_directory;

create view public.v_student_directory as
select
  p.student_id,
  p.full_name,
  p.faculty,
  p.major,
  p.year_level,
  case
    when s.id is not null then 'Done'
    else 'Pending'
  end as current_status,
  s.created_at as last_submission_at
from public.student_profiles p
left join public.assessment_submissions s on s.student_id = p.student_id 
  and s.term_key = public.get_current_term_key();

comment on view public.v_student_directory is 'รายชื่อนักศึกษาพร้อมสถานะการทำแบบทดสอบในเทอมปัจจุบัน';
