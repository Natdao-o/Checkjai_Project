-- รันใน Supabase SQL Editor เมื่อยังเข้าระบบอาจารย์ไม่ได้เพราะตาราง teachers ว่าง
-- (ต้องรัน teachers_login.sql ให้ครบก่อน ให้ได้ตาราง + ฟังก์ชัน login_teacher)

insert into public.teachers (username, password)
values (
  'teacher',
  crypt('teacher123', gen_salt('bf'))
)
on conflict (username) do update
set password = excluded.password;

-- ใช้ล็อกอิน: username = teacher , password = teacher123 ที่หน้า /admin/login
