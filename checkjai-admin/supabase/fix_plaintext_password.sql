-- ถ้าเคยใส่รหัส plain text ในคอลัมน์ password ให้รันคำสั่งนี้ (แก้ student_id / รหัสตามจริง)
-- รันหลังจากมีตาราง public.users และคอลัมน์ student_id, password แล้ว

update public.users
set password = crypt('123456789', gen_salt('bf'))
where student_id = '6452100963';

-- หรือถ้ายังไม่มีแถว ให้ insert แทน
-- insert into public.users (student_id, password)
-- values ('6452100963', crypt('123456789', gen_salt('bf')));
