-- ==========================================
-- 1. SCHEMA SETUP (Tables, Triggers, Views)
-- ==========================================

-- ตารางตั้งค่าเทอม
drop table if exists public.semester_configs cascade;
create table public.semester_configs (
  id uuid primary key default gen_random_uuid(),
  semester_name text not null,
  academic_year text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz default now()
);

-- Trigger ควบคุม is_active ให้มีได้แค่ 1 เทอม
create or replace function public.handle_semester_is_active()
returns trigger as $$
begin
  if new.is_active = true then
    update public.semester_configs set is_active = false where id <> new.id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_semester_is_active
before insert or update of is_active on public.semester_configs
for each row execute function public.handle_semester_is_active();

-- View สำหรับ Student Directory (Automatic Snapshot)
create or replace view public.v_admin_student_directory as
with active_term as (
  select start_date, end_date from public.semester_configs where is_active = true limit 1
)
select distinct on (p.student_id)
  p.student_id, p.full_name, p.faculty, p.major, p.year_level,
  s.id as latest_submission_id, s.created_at as latest_submission_at,
  s.eq_total_score,
  (s.dass_depression->>'doubled')::float as latest_depression_score,
  (s.dass_anxiety->>'doubled')::float as latest_anxiety_score,
  (s.dass_stress->>'doubled')::float as latest_stress_score,
  case when s.id is not null then 'Submitted' else 'Pending' end as status
from public.student_profiles p
left join public.assessment_submissions s on s.student_id = p.student_id
  and s.created_at >= (select start_date from active_term)
  and s.created_at <= (select end_date from active_term)
order by p.student_id, s.created_at desc;

-- View สำหรับ Dashboard Analytics
create or replace view public.v_dashboard_submissions as
select 
  s.id, s.student_id, s.created_at, s.eq_total_score,
  (s.dass_depression->>'doubled')::float as d_score,
  (s.dass_anxiety->>'doubled')::float as a_score,
  (s.dass_stress->>'doubled')::float as s_score,
  p.faculty, p.major, p.year_level,
  c.id as semester_id, c.semester_name, c.academic_year, c.is_active as is_current_term
from public.assessment_submissions s
join public.student_profiles p on s.student_id = p.student_id
left join public.semester_configs c on s.created_at >= c.start_date and s.created_at <= c.end_date;

-- ==========================================
-- 2. MOCK DATA (Semesters & Students)
-- ==========================================

-- ข้อมูลเทอม
insert into public.semester_configs (semester_name, academic_year, start_date, end_date, is_active) values
('1', '2568', '2025-06-01', '2025-10-31', false),
('2', '2568', '2025-11-01', '2026-03-31', false),
('1', '2569', '2026-06-01', '2026-10-31', true);

-- ข้อมูลนักศึกษาจำลอง (50 คน)
do $$
declare
  facs text[] := array['Engineering', 'Arts', 'Science', 'Business'];
  majors text[] := array['Computer', 'Social', 'Biology', 'Marketing'];
  sid text;
  fn text;
  f text;
  m text;
begin
  for i in 1..50 loop
    sid := '690' || lpad(i::text, 3, '0');
    fn := 'Student Name ' || i;
    f := facs[1 + (i % 4)];
    m := majors[1 + (i % 4)];
    
    insert into public.student_profiles (student_id, full_name, faculty, major, year_level)
    values (sid, fn, f, m, (i % 4) + 1);
    
    -- สร้างผลทดสอบจำลอง (สุ่มเทอมละ 1 ครั้ง สำหรับบางคน)
    -- เทอม 1/2568
    if i % 2 = 0 then
      insert into public.assessment_submissions (student_id, eq_total_score, dass_depression, dass_anxiety, dass_stress, created_at)
      values (sid, 40 + (i % 20), jsonb_build_object('doubled', 5 + (i % 15)), jsonb_build_object('doubled', 4 + (i % 10)), jsonb_build_object('doubled', 10 + (i % 12)), '2025-07-15');
    end if;
    
    -- เทอม 1/2569 (ปัจจุบัน) - ใส่ความหลากหลายของคะแนน
    insert into public.assessment_submissions (student_id, eq_total_score, dass_depression, dass_anxiety, dass_stress, created_at)
    values (
      sid, 
      30 + (i % 30), 
      jsonb_build_object('doubled', case when i % 5 = 0 then 25 else 5 + (i % 10) end), -- บางคนเสี่ยงสูง
      jsonb_build_object('doubled', case when i % 7 = 0 then 22 else 4 + (i % 8) end),
      jsonb_build_object('doubled', case when i % 10 = 0 then 30 else 10 + (i % 10) end),
      '2026-07-20'
    );
  end loop;
end $$;

insert into public.student_profiles (student_id, full_name, faculty, major, year_level)
values ('6452100963', 'ภูชิต', 'Engineering', 'Computer', 3)
on conflict (student_id) do update set full_name = 'ภูชิต';

-- เพิ่มบัญชีและโปรไฟล์ของคุณ ณัฐดาว โอดสันเทียะ
insert into public.users (student_id, password)
values ('6652100584', extensions.crypt('123456', extensions.gen_salt('bf')))
on conflict (student_id) do update set password = excluded.password;

insert into public.student_profiles (student_id, full_name, faculty, major, year_level)
values ('6652100584', 'ณัฐดาว โอดสันเทียะ', 'วิศวกรรมศาสตร์และเทคโนโลยี', 'เทคโนโลยีดิจิทัลและสาระสนเทศ (DIT)', 4)
on conflict (student_id) do update set 
  full_name = excluded.full_name,
  faculty = excluded.faculty,
  major = excluded.major,
  year_level = excluded.year_level;
