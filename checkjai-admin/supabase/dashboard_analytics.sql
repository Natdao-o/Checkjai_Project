-- 1. ฟังก์ชันสำหรับคำนวณระดับความเสี่ยง DASS-21
create or replace function public.get_dass_level(category text, score float)
returns text as $$
begin
  if category = 'depression' then
    if score <= 9 then return 'Normal';
    elsif score <= 13 then return 'Mild';
    elsif score <= 20 then return 'Moderate';
    elsif score <= 27 then return 'Severe';
    else return 'Extremely Severe';
    end if;
  elsif category = 'anxiety' then
    if score <= 7 then return 'Normal';
    elsif score <= 9 then return 'Mild';
    elsif score <= 14 then return 'Moderate';
    elsif score <= 19 then return 'Severe';
    else return 'Extremely Severe';
    end if;
  elsif category = 'stress' then
    if score <= 14 then return 'Normal';
    elsif score <= 18 then return 'Mild';
    elsif score <= 25 then return 'Moderate';
    elsif score <= 33 then return 'Severe';
    else return 'Extremely Severe';
    end if;
  else
    return 'Unknown';
  end if;
end;
$$ language plpgsql;

-- 2. View สำหรับดึงข้อมูลสรุป Dashboard (เชื่อมเทอมและโปรไฟล์)
create or replace view public.v_dashboard_submissions as
select 
  s.id,
  s.student_id,
  s.created_at,
  s.eq_total_score,
  (s.dass_depression->>'doubled')::float as d_score,
  (s.dass_anxiety->>'doubled')::float as a_score,
  (s.dass_stress->>'doubled')::float as s_score,
  p.faculty,
  p.major,
  p.year_level,
  c.id as semester_id,
  c.semester_name,
  c.academic_year,
  c.is_active as is_current_term
from public.assessment_submissions s
join public.student_profiles p on s.student_id = p.student_id
left join public.semester_configs c on s.created_at >= c.start_date and s.created_at <= c.end_date;

comment on view public.v_dashboard_submissions is 'ข้อมูลสำหรับทำ Dashboard Analytics';
