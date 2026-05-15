-- สร้าง View ใหม่สำหรับ Student Directory (1 แถวต่อ 1 คน พร้อมผลล่าสุด)
drop view if exists public.v_admin_student_directory;

create view public.v_admin_student_directory as
select distinct on (p.student_id)
  p.student_id,
  p.full_name,
  p.faculty,
  p.major,
  p.year_level,
  s.id as latest_submission_id,
  s.created_at as latest_submission_at,
  s.eq_total_score,
  s.dass_depression->>'doubled' as latest_depression_score,
  s.dass_anxiety->>'doubled' as latest_anxiety_score,
  s.dass_stress->>'doubled' as latest_stress_score,
  case 
    when s.id is not null then 'Submitted'
    else 'Pending'
  end as status
from public.student_profiles p
left join public.assessment_submissions s on s.student_id = p.student_id
order by p.student_id, s.created_at desc;

comment on view public.v_admin_student_directory is 'รายชื่อนักศึกษาพร้อมผลคะแนนล่าสุด (Automatic Snapshot)';
