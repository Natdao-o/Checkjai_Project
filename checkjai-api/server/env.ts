/**
 * โหลด checkjai/.env เสมอ (ไม่พึ่ง cwd)
 * - แก้ปัญหา BOM ที่ต้นบรรทัดแรก ทำให้ตัวแปรแรกโหลดไม่ได้
 * - merge .env แล้ว .env.local (ทับค่าทีหลัง)
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'dotenv'

const dir = dirname(fileURLToPath(import.meta.url))
const roots = ['.env', '.env.local']

for (const name of roots) {
  const p = resolve(dir, '..', name)
  if (!existsSync(p)) continue
  let raw = readFileSync(p, 'utf8')
  /* strip UTF-8 BOM */
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1)
  }
  const parsed = parse(raw)
  for (const [k, val] of Object.entries(parsed)) {
    const trimmed =
      typeof val === 'string'
        ? val.replace(/\r$/, '').trim()
        : String(val ?? '')
    process.env[k] = trimmed
  }
}

/* ชื่อตัวแปรจากด็อกเมนต์ใหม่ของ Supabase (ถ้ามีอยู่ .env เดียวกัน) */
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_SECRET) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET
}
