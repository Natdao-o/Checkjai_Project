import './env'
import cors from 'cors'
import { randomBytes } from 'node:crypto'
import express from 'express'
import { createClient } from '@supabase/supabase-js'
import { calculateEqTotal } from './lib/eqScore.ts'
import { calculateDass21, isDass21Complete } from './lib/dass21Score.ts'

const app = express()
const port = Number(process.env.API_PORT) || 3001

const supabaseUrl = (
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  ''
).trim()
const supabaseKey = (
  process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ''
).trim()

const supabase = createClient(supabaseUrl, supabaseKey)

const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()
const supabaseService =
  serviceRoleKey && supabaseUrl
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null

type TeacherSession = { username: string; expires: number }
const teacherSessions = new Map<string, TeacherSession>()
const TEACHER_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

function pruneTeacherSessions() {
  const now = Date.now()
  for (const [tok, s] of teacherSessions) {
    if (now > s.expires) teacherSessions.delete(tok)
  }
}

function createTeacherSession(username: string): string {
  pruneTeacherSessions()
  const token = randomBytes(32).toString('hex')
  teacherSessions.set(token, {
    username,
    expires: Date.now() + TEACHER_SESSION_TTL_MS,
  })
  return token
}

function getTeacherUsernameFromAuthHeader(
  authorization: string | undefined,
): string | null {
  if (!authorization) return null
  const m = authorization.match(/^Bearer\s+(.+)$/i)
  const token = m?.[1]?.trim()
  if (!token) return null
  const s = teacherSessions.get(token)
  if (!s || Date.now() > s.expires) {
    teacherSessions.delete(token)
    return null
  }
  return s.username
}

function requireAdminDb(res: express.Response) {
  if (!supabaseUrl || !serviceRoleKey || !supabaseService) {
    res.status(503).json({
      ok: false,
      message:
        'เซิร์ฟเวอร์ยังไม่ตั้ง SUPABASE_SERVICE_ROLE_KEY — ใช้ค้นประวัติแบบทดสอบไม่ได้',
    })
    return null
  }
  return supabaseService
}

function deriveCurrentTermKey(now = new Date()): string {
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const term = m >= 6 && m <= 10 ? 1 : 2
  return `${y}-T${term}`
}

function getActiveTermKey(): string {
  const fromEnv = String(process.env.ACTIVE_TERM_KEY ?? '').trim()
  if (fromEnv) return fromEnv
  return deriveCurrentTermKey()
}
app.use(
  cors({
    origin: true, // หรือระบุ ['http://localhost:5173', 'http://localhost:5174', /\.vercel\.app$/]
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  const hasUrl = Boolean(supabaseUrl)
  const hasAnon = Boolean(supabaseKey)
  const hasServiceRole = serviceRoleKey.length > 0
  res.json({
    ok: true,
    service: 'checkjai-api',
    supabaseConfigured: hasUrl && hasAnon,
    /** ควรเป็น true เมื่อ checkjai/.env มี SUPABASE_SERVICE_ROLE_KEY แล้วรีสตาร์ท API */
    adminSearchConfigured: hasUrl && hasServiceRole,
    /** ใช้ดูว่าขาดอะไร (ไม่ส่งค่าคีย์จริง) */
    checks: {
      hasSupabaseUrl: hasUrl,
      hasAnonKey: hasAnon,
      hasServiceRoleKey: hasServiceRole,
    },
  })
})

app.post('/api/auth/login', async (req, res) => {
  const student_id = String(req.body?.student_id ?? '').trim()
  const password = String(req.body?.password ?? '')

  if (!student_id || !password) {
    return res.status(400).json({
      ok: false,
      message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน',
    })
  }

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      ok: false,
      message: 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Supabase',
    })
  }

  const { data, error } = await supabase.rpc('login_user', {
    p_student_id: student_id,
    p_password: password,
  })

  if (error) {
    return res.status(500).json({
      ok: false,
      message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่',
      details: error.message,
      code: error.code,
    })
  }

  const rows = data as { student_id: string }[] | null
  if (!rows?.length) {
    return res.status(401).json({
      ok: false,
      message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    })
  }

  const sid = rows[0].student_id

  // Use admin client if available to fetch full name from student_profiles
  const client = serviceRoleKey ? supabaseService : supabase
  const { data: profile } = await client
    .from('student_profiles')
    .select('full_name')
    .eq('student_id', sid)
    .single()

  return res.json({ 
    ok: true, 
    student_id: sid, 
    full_name: profile?.full_name ?? sid 
  })
})

app.get('/api/auth/me', async (req, res) => {
  const sid = String(req.query.student_id ?? '').trim()
  if (!sid) return res.status(400).json({ ok: false })

  // Use admin client if available to bypass RLS for identity check
  const client = serviceRoleKey ? supabaseService : supabase
  
  const { data: profile } = await client
    .from('student_profiles')
    .select('full_name, student_id, faculty, major, year_level')
    .eq('student_id', sid)
    .maybeSingle()

  if (!profile) {
    return res.json({ ok: true, student_id: sid, full_name: sid })
  }

  res.json({ 
    ok: true, 
    full_name: profile.full_name,
    student_id: profile.student_id,
    faculty: profile.faculty,
    major: profile.major,
    year_level: profile.year_level
  })
})

app.get('/api/history', async (req, res) => {
  const sid = String(req.query.student_id ?? '').trim()
  if (!sid) return res.status(400).json({ ok: false, message: 'ไม่พบรหัสนักศึกษา' })

  const client = serviceRoleKey ? supabaseService : supabase
  const { data, error } = await client
    .from('assessment_submissions')
    .select('id, created_at, eq_total_score')
    .eq('student_id', sid)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ ok: false, message: 'ดึงประวัติไม่สำเร็จ', details: error.message })
  }

  res.json({ ok: true, history: data ?? [] })
})

app.post('/api/auth/teacher/login', async (req, res) => {
  const username = String(req.body?.username ?? '').trim()
  const password = String(req.body?.password ?? '')

  if (!username || !password) {
    return res.status(400).json({
      ok: false,
      message: 'กรุณากรอก Username และ Password',
    })
  }

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      ok: false,
      message: 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Supabase',
    })
  }

  const { data, error } = await supabase.rpc('login_teacher', {
    p_username: username,
    p_password: password,
  })

  if (error) {
    return res.status(500).json({
      ok: false,
      message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่',
      details: error.message,
      code: error.code,
    })
  }

  const rows = data as { username: string }[] | null
  if (!rows?.length) {
    return res.status(401).json({
      ok: false,
      message: 'Username หรือ Password ไม่ถูกต้อง',
    })
  }

  const token = createTeacherSession(rows[0].username)
  return res.json({ ok: true, username: rows[0].username, token })
})

app.post('/api/auth/teacher/logout', (req, res) => {
  const m = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)
  const tok = m?.[1]?.trim()
  if (tok) teacherSessions.delete(tok)
  res.json({ ok: true })
})

app.get('/api/admin/meta', async (req, res) => {
  const u = getTeacherUsernameFromAuthHeader(req.headers.authorization)
  if (!u) {
    return res.status(401).json({ ok: false, message: 'กรุณาเข้าสู่ระบบใหม่ (อาจารย์)' })
  }
  const svc = requireAdminDb(res)
  if (!svc) return

  try {
    const { data, error } = await svc.from('student_profiles').select('faculty, major, year_level')
    if (error) {
      return res.status(500).json({
        ok: false,
        message: 'ดึงตัวเลือกกรองไม่สำเร็จ',
        details: error.message,
      })
    }
    const rows = data ?? []
    const faculties = [
      ...new Set(rows.map((r) => r.faculty).filter((x): x is string => Boolean(x))),
    ].sort()
    const majors = [
      ...new Set(rows.map((r) => r.major).filter((x): x is string => Boolean(x))),
    ].sort()
    const years = [
      ...new Set(
        rows.map((r) => r.year_level).filter((x): x is number => typeof x === 'number'),
      ),
    ].sort((a, b) => a - b)

    return res.json({ ok: true, faculties, majors, years })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return res.status(500).json({ ok: false, message: msg })
  }
})

function escapeIlike(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

app.get('/api/admin/assessments', async (req, res) => {
  const u = getTeacherUsernameFromAuthHeader(req.headers.authorization)
  if (!u) {
    return res.status(401).json({ ok: false, message: 'กรุณาเข้าสู่ระบบใหม่ (อาจารย์)' })
  }
  const svc = requireAdminDb(res)
  if (!svc) return

  try {
    let q = svc.from('v_admin_student_directory').select('*', { count: 'exact' })

    const qStudent = String(req.query.q ?? req.query.student_id ?? '').trim()
    if (qStudent) {
      const e = escapeIlike(qStudent)
      q = q.or(
        `student_id.ilike.%${e}%,full_name.ilike.%${e}%`,
      )
    }

    const faculty = String(req.query.faculty ?? '').trim()
    if (faculty) q = q.eq('faculty', faculty)

    const major = String(req.query.major ?? '').trim()
    if (major) q = q.eq('major', major)

    const yearLevel = req.query.year_level
    if (yearLevel !== undefined && yearLevel !== '') {
      const y = Number(yearLevel)
      if (Number.isFinite(y)) q = q.eq('year_level', y)
    }

    const status = String(req.query.status ?? '').trim()
    if (status) q = q.eq('status', status)

    const sortKey = String(req.query.sort || 'student_id')
    const asc = String(req.query.order || 'asc') === 'asc'
    const col =
      sortKey === 'name'
        ? 'full_name'
        : sortKey === 'faculty'
          ? 'faculty'
          : sortKey === 'major'
            ? 'major'
            : sortKey === 'year'
              ? 'year_level'
              : sortKey === 'status'
                ? 'status'
                : 'student_id'

    // Pagination
    const limit = Number(req.query.limit) || 50
    const page = Number(req.query.page) || 1
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await q
      .order(col, { ascending: asc, nullsFirst: false })
      .range(from, to)

    if (error) {
      return res.status(500).json({
        ok: false,
        message: 'ดึงข้อมูลนักศึกษาไม่สำเร็จ',
        details: error.message,
        code: error.code,
      })
    }

    return res.json({ 
      ok: true, 
      rows: data ?? [], 
      total: count ?? 0,
      page,
      limit,
      teacher: u 
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return res.status(500).json({ ok: false, message: msg })
  }
})


app.get('/api/admin/students/:studentId/history', async (req, res) => {
  const u = getTeacherUsernameFromAuthHeader(req.headers.authorization)
  if (!u) {
    return res.status(401).json({ ok: false, message: 'กรุณาเข้าสู่ระบบใหม่ (อาจารย์)' })
  }
  const svc = requireAdminDb(res)
  if (!svc) return

  const studentId = String(req.params.studentId ?? '').trim()
  if (!studentId) {
    return res.status(400).json({ ok: false, message: 'ไม่พบรหัสนักศึกษา' })
  }

  try {
    const [{ data: profileData, error: profileErr }, { data: historyData, error: historyErr }] =
      await Promise.all([
        svc
          .from('student_profiles')
          .select('student_id, full_name, faculty, major, year_level')
          .eq('student_id', studentId)
          .maybeSingle(),
        svc
          .from('assessment_submissions')
          .select(
            'id, created_at, eq_total_score, eq_answers, dass_answers, dass_depression, dass_anxiety, dass_stress',
          )
          .eq('student_id', studentId)
          .order('created_at', { ascending: false }),
      ])

    if (profileErr) {
      return res.status(500).json({
        ok: false,
        message: 'ดึงข้อมูลนักศึกษาไม่สำเร็จ',
        details: profileErr.message,
      })
    }
    if (historyErr) {
      return res.status(500).json({
        ok: false,
        message: 'ดึงประวัติแบบทดสอบไม่สำเร็จ',
        details: historyErr.message,
      })
    }

    return res.json({
      ok: true,
      student: {
        student_id: studentId,
        full_name: profileData?.full_name ?? null,
        faculty: profileData?.faculty ?? null,
        major: profileData?.major ?? null,
        year_level: profileData?.year_level ?? null,
      },
      history: historyData ?? [],
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return res.status(500).json({ ok: false, message: msg })
  }
})

function isEq52(answers: unknown): answers is number[] {
  if (!Array.isArray(answers) || answers.length !== 52) return false
  for (const v of answers) {
    if (typeof v !== 'number' || v < 0 || v > 3) return false
  }
  return true
}

app.post('/api/assessment/submit', async (req, res) => {
  const { eq_answers, dass_answers, student_id: bodyStudent } = req.body ?? {}
  const student_id =
    bodyStudent == null
      ? null
      : String(bodyStudent).trim() || null

  if (!isEq52(eq_answers) || !isDass21Complete(dass_answers as number[])) {
    return res.status(400).json({
      ok: false,
      message: 'รูปแบบคำตอบไม่ถูกต้อง (ต้องมี EQ 52 ข้อ และ DASS-21 21 ข้อ)',
    })
  }

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      ok: false,
      message: 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Supabase',
    })
  }
  const termKey = getActiveTermKey()

  const eqResult = calculateEqTotal(eq_answers as (number | null)[])
  if (eqResult.answeredCount !== 52) {
    return res.status(400).json({ ok: false, message: 'แบบ EQ ยังตอบไม่ครบ 52 ข้อ' })
  }

  if (!dass_answers || !Array.isArray(dass_answers)) {
    return res.status(400).json({ ok: false, message: 'DASS-21 ไม่ครบ' })
  }
  const dr = calculateDass21(dass_answers as number[])

  if (!student_id) {
    return res.status(400).json({ ok: false, message: 'ไม่พบรหัสนักศึกษา' })
  }

  // ใช้ service role เมื่อมีเพื่อหลีกเลี่ยง RLS และเรียก RPC เดียวเพื่อลด latency
  const writer = supabaseService ?? supabase
  const { data, error } = await writer.rpc('save_assessment_submission', {
    p_student_id: student_id,
    p_term_key: termKey,
    p_eq_answers: eq_answers as number[],
    p_eq_total_score: eqResult.total,
    p_dass_answers: dass_answers as number[],
    p_dass_depression: dr.depression,
    p_dass_anxiety: dr.anxiety,
    p_dass_stress: dr.stress,
  })

  if (error) {
    if (error.code === 'P0001' && error.message?.includes('TERM_CONFIRMED')) {
      return res.status(409).json({
        ok: false,
        message: `เทอม ${termKey} ถูกยืนยันการเก็บข้อมูลแล้ว ไม่สามารถเขียนทับได้`,
      })
    }
    return res.status(500).json({
      ok: false,
      message: 'บันทึกลงฐานข้อมูลไม่สำเร็จ',
      details: error.message,
      code: error.code,
    })
  }

  return res.json({ ok: true, term_key: termKey, submission_id: data ?? null })
})

app.get('/api/admin/semesters', async (req, res) => {
  const u = getTeacherUsernameFromAuthHeader(req.headers.authorization)
  if (!u) return res.status(401).json({ ok: false, message: 'กรุณาเข้าสู่ระบบใหม่' })
  const svc = requireAdminDb(res)
  if (!svc) return

  const { data, error } = await svc
    .from('semester_configs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ ok: false, message: error.message })
  return res.json({ ok: true, semesters: data ?? [] })
})

app.post('/api/admin/semesters', async (req, res) => {
  const u = getTeacherUsernameFromAuthHeader(req.headers.authorization)
  if (!u) return res.status(401).json({ ok: false, message: 'กรุณาเข้าสู่ระบบใหม่' })
  const svc = requireAdminDb(res)
  if (!svc) return

  const { semester_name, academic_year, start_date, end_date } = req.body
  const { data, error } = await svc
    .from('semester_configs')
    .insert([{ semester_name, academic_year, start_date, end_date }])
    .select()

  if (error) return res.status(500).json({ ok: false, message: error.message })
  return res.json({ ok: true, semester: data?.[0] })
})

app.post('/api/admin/semesters/:id/activate', async (req, res) => {
  const u = getTeacherUsernameFromAuthHeader(req.headers.authorization)
  if (!u) return res.status(401).json({ ok: false, message: 'กรุณาเข้าสู่ระบบใหม่' })
  const svc = requireAdminDb(res)
  if (!svc) return

  const { id } = req.params
  const { error } = await svc
    .from('semester_configs')
    .update({ is_active: true })
    .eq('id', id)

  if (error) return res.status(500).json({ ok: false, message: error.message })
  return res.json({ ok: true })
})

app.delete('/api/admin/semesters/:id', async (req, res) => {
  const u = getTeacherUsernameFromAuthHeader(req.headers.authorization)
  if (!u) return res.status(401).json({ ok: false, message: 'กรุณาเข้าสู่ระบบใหม่' })
  const svc = requireAdminDb(res)
  if (!svc) return

  const { id } = req.params
  const { error } = await svc
    .from('semester_configs')
    .delete()
    .eq('id', id)

  if (error) return res.status(500).json({ ok: false, message: error.message })
  return res.json({ ok: true })
})

app.get('/api/admin/dashboard/stats', async (req, res) => {
  const u = getTeacherUsernameFromAuthHeader(req.headers.authorization)
  if (!u) return res.status(401).json({ ok: false, message: 'กรุณาเข้าสู่ระบบใหม่' })
  const svc = requireAdminDb(res)
  if (!svc) return

  try {
    const { semester_id, faculty, major } = req.query
    let q = svc.from('v_dashboard_submissions').select('*')

    if (semester_id === 'current') {
      q = q.eq('is_current_term', true)
    } else if (semester_id && semester_id !== 'all') {
      q = q.eq('semester_id', semester_id)
    }

    if (faculty) q = q.eq('faculty', faculty)
    if (major) q = q.eq('major', major)

    const { data, error } = await q
    if (error) throw error

    const rows = data ?? []
    const total = rows.length

    // Average Scores
    const avgD = total ? rows.reduce((acc, r) => acc + (r.d_score || 0), 0) / total : 0
    const avgA = total ? rows.reduce((acc, r) => acc + (r.a_score || 0), 0) / total : 0
    const avgS = total ? rows.reduce((acc, r) => acc + (r.s_score || 0), 0) / total : 0
    const avgEQ = total ? rows.reduce((acc, r) => acc + (r.eq_total_score || 0), 0) / total : 0

    // Distribution by Risk Level (Depression as main example)
    const levels = {
      Normal: 0,
      Mild: 0,
      Moderate: 0,
      Severe: 0,
      'Extremely Severe': 0,
    }

    const getLevel = (score: number) => {
      if (score <= 9) return 'Normal'
      if (score <= 13) return 'Mild'
      if (score <= 20) return 'Moderate'
      if (score <= 27) return 'Severe'
      return 'Extremely Severe'
    }

    rows.forEach((r) => {
      const lv = getLevel(r.d_score || 0)
      if (levels[lv as keyof typeof levels] !== undefined) {
        levels[lv as keyof typeof levels]++
      }
    })

    const distribution = Object.entries(levels).map(([name, value]) => ({ name, value }))

    // Trends (Simplified: Group by semester_name + academic_year)
    let trendQuery = svc.from('v_dashboard_submissions').select('semester_name, academic_year, d_score, a_score, s_score')
    
    if (faculty) trendQuery = trendQuery.eq('faculty', faculty)
    if (major) trendQuery = trendQuery.eq('major', major)

    const { data: allData, error: allErr } = await trendQuery
    
    const trendsMap: Record<string, { d: number[]; a: number[]; s: number[] }> = {}
    if (!allErr && allData) {
      allData.forEach(r => {
        if (r.semester_name && r.academic_year) {
          const key = `${r.semester_name}/${r.academic_year}`
          if (!trendsMap[key]) trendsMap[key] = { d: [], a: [], s: [] }
          trendsMap[key].d.push(r.d_score || 0)
          trendsMap[key].a.push(r.a_score || 0)
          trendsMap[key].s.push(r.s_score || 0)
        }
      })
    }

    const trends = Object.entries(trendsMap).map(([name, scores]) => ({
      name,
      Depression: scores.d.length ? Number((scores.d.reduce((a, b) => a + b, 0) / scores.d.length).toFixed(1)) : 0,
      Anxiety: scores.a.length ? Number((scores.a.reduce((a, b) => a + b, 0) / scores.a.length).toFixed(1)) : 0,
      Stress: scores.s.length ? Number((scores.s.reduce((a, b) => a + b, 0) / scores.s.length).toFixed(1)) : 0,
    })).sort((a, b) => {
      const [termA, yearA] = a.name.split('/').map(Number)
      const [termB, yearB] = b.name.split('/').map(Number)
      if (yearA !== yearB) return yearA - yearB
      return termA - termB
    })

    // Faculty Averages (Filter out null/empty faculty)
    const facultyAveragesMap: Record<string, { d: number[]; a: number[]; s: number[] }> = {}
    rows.forEach(r => {
      const fac = (r.faculty || '').trim()
      if (fac) {
        if (!facultyAveragesMap[fac]) facultyAveragesMap[fac] = { d: [], a: [], s: [] }
        facultyAveragesMap[fac].d.push(r.d_score || 0)
        facultyAveragesMap[fac].a.push(r.a_score || 0)
        facultyAveragesMap[fac].s.push(r.s_score || 0)
      }
    })

    const facultyAverages = Object.entries(facultyAveragesMap).map(([name, scores]) => ({
      name,
      Depression: scores.d.length ? Number((scores.d.reduce((a, b) => a + b, 0) / scores.d.length).toFixed(1)) : 0,
      Anxiety: scores.a.length ? Number((scores.a.reduce((a, b) => a + b, 0) / scores.a.length).toFixed(1)) : 0,
      Stress: scores.s.length ? Number((scores.s.reduce((a, b) => a + b, 0) / scores.s.length).toFixed(1)) : 0,
    })).sort((a, b) => a.name.localeCompare(b.name))

    const topFaculty = [...facultyAverages].sort((a, b) => b.Depression - a.Depression)[0]?.name || '-'

    // ----------------------------------------------------
    // Risk Students Calculation
    // ----------------------------------------------------
    const getDLevel = (score: number) => {
      if (score <= 9) return 'Normal'; if (score <= 13) return 'Mild'; if (score <= 20) return 'Moderate'; if (score <= 27) return 'Severe'; return 'Extremely Severe';
    }
    const getALevel = (score: number) => {
      if (score <= 7) return 'Normal'; if (score <= 9) return 'Mild'; if (score <= 14) return 'Moderate'; if (score <= 19) return 'Severe'; return 'Extremely Severe';
    }
    const getSLevel = (score: number) => {
      if (score <= 14) return 'Normal'; if (score <= 18) return 'Mild'; if (score <= 25) return 'Moderate'; if (score <= 33) return 'Severe'; return 'Extremely Severe';
    }

    const atRiskStudents: any[] = []
    
    // Process unique students (take the most recent submission if they have multiple in this dataset)
    const processedSids = new Set<string>()
    // Assuming 'rows' is sorted by created_at desc (we should sort it just in case)
    const sortedRows = [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    sortedRows.forEach(r => {
      if (processedSids.has(r.student_id)) return
      processedSids.add(r.student_id)

      const dLv = getDLevel(r.d_score || 0)
      const aLv = getALevel(r.a_score || 0)
      const sLv = getSLevel(r.s_score || 0)

      let status = null
      if (['Severe', 'Extremely Severe'].includes(dLv) || ['Severe', 'Extremely Severe'].includes(aLv) || ['Severe', 'Extremely Severe'].includes(sLv)) {
        status = 'กลุ่มเสี่ยงสูง (High Risk)'
      } else if (['Moderate'].includes(dLv) || ['Moderate'].includes(aLv) || ['Moderate'].includes(sLv)) {
        status = 'กลุ่มเฝ้าระวัง (Needs Monitoring)'
      }

      if (status) {
        atRiskStudents.push({
          student_id: r.student_id,
          faculty: r.faculty || '-',
          d_score: r.d_score || 0,
          a_score: r.a_score || 0,
          s_score: r.s_score || 0,
          status,
          full_name: 'กำลังโหลด...' // Placeholder, will fetch next
        })
      }
    })

    // Fetch names for at-risk students
    if (atRiskStudents.length > 0) {
      const riskSids = atRiskStudents.map(s => s.student_id)
      const { data: profilesData } = await svc.from('student_profiles').select('student_id, full_name').in('student_id', riskSids)
      
      const profileMap = new Map((profilesData || []).map(p => [p.student_id, p.full_name]))
      atRiskStudents.forEach(s => {
        s.full_name = profileMap.get(s.student_id) || s.student_id
      })
    }

    return res.json({
      ok: true,
      stats: {
        totalSubmissions: total,
        avgScores: { d: avgD, a: avgA, s: avgS, eq: avgEQ },
        distribution,
        trends,
        topFaculty,
        facultyAverages,
        riskStudents: atRiskStudents
      }
    })
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e.message })
  }
})

// สำหรับ Vercel Serverless Functions
export default app;

// รันเฉพาะเมื่อไม่ได้อยู่บน Vercel (Local Development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`[checkjai-api] http://localhost:${port}`)
  })
}
