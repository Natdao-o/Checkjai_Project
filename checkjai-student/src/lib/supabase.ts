import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ตรวจสอบ Environment Variables (สำหรับการ Debug บน Vercel)
console.log('[Supabase] VITE_SUPABASE_URL is defined:', !!url)
console.log('[Supabase] VITE_SUPABASE_ANON_KEY is defined:', !!anonKey)

if (!url || !anonKey) {
  console.warn(
    '[supabase] ตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ในไฟล์ .env หรือ Environment Variables ใน Vercel ให้ถูกต้อง',
  )
}

export const supabase = createClient(url ?? '', anonKey ?? '')

/** ล็อกอินผ่าน `POST /api/auth/login` — DB: ตาราง `public.users` (student_id, password), RPC `login_user` */
