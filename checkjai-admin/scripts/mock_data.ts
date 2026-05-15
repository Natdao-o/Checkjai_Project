import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env from the root of the project
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function mock() {
  console.log('Starting mock data generation...')

  // 1. Create Semesters
  const semesters = [
    { semester_name: '1', academic_year: '2566', start_date: '2023-06-01T00:00:00Z', end_date: '2023-10-31T23:59:59Z', is_active: false },
    { semester_name: '2', academic_year: '2566', start_date: '2023-11-01T00:00:00Z', end_date: '2024-03-31T23:59:59Z', is_active: false },
    { semester_name: '1', academic_year: '2567', start_date: '2024-06-01T00:00:00Z', end_date: '2024-10-31T23:59:59Z', is_active: true },
  ]

  for (const s of semesters) {
    const { data: existing } = await supabase
      .from('semester_configs')
      .select('id')
      .match({ semester_name: s.semester_name, academic_year: s.academic_year })
      .maybeSingle()
    
    if (!existing) {
      console.log(`Creating semester ${s.semester_name}/${s.academic_year}`)
      await supabase.from('semester_configs').insert(s)
    } else {
      // Ensure dates are correct for existing semesters so the view join works
      await supabase.from('semester_configs').update({
        start_date: s.start_date,
        end_date: s.end_date
      }).eq('id', existing.id)
    }
  }

  // 2. Create Students (50 students across 5 faculties)
  const faculties = ['Engineering', 'Science', 'Arts', 'Medicine', 'Business']
  const studentIds = Array.from({ length: 50 }, (_, i) => `MOCK${1000 + i}`)
  
  console.log('Ensuring mock students exist...')
  for (const sid of studentIds) {
    const { data: existing } = await supabase.from('student_profiles').select('student_id').eq('student_id', sid).maybeSingle()
    if (!existing) {
      const faculty = faculties[Math.floor(Math.random() * faculties.length)]
      await supabase.from('student_profiles').insert({
        student_id: sid,
        full_name: `Mock Student ${sid}`,
        faculty,
        major: `${faculty} Major`,
        year_level: Math.floor(Math.random() * 4) + 1
      })
    }
  }

  // 3. Insert Submissions
  console.log('Generating sophisticated submissions for 3 semesters...')
  const allSemesters = (await supabase.from('semester_configs').select('*')).data || []
  
  // Clear old mock submissions to avoid duplicates if re-running
  await supabase.from('assessment_submissions').delete().ilike('student_id', 'MOCK%')

  // Fetch student profiles to know their faculty
  const { data: profiles } = await supabase.from('student_profiles').select('student_id, faculty').ilike('student_id', 'MOCK%')
  const studentMap = new Map((profiles || []).map(p => [p.student_id, p.faculty]))

  for (const semester of allSemesters) {
    // Only mock for the 3 semesters we care about
    const isMockTerm = semesters.some(s => s.semester_name === semester.semester_name && s.academic_year === semester.academic_year)
    if (!isMockTerm) continue

    console.log(`Mocking data for ${semester.semester_name}/${semester.academic_year}...`)
    
    // Pick most students to have a good sample size
    const sampledStudents = studentIds.slice(0, 40 + Math.floor(Math.random() * 10))
    
    const submissions = sampledStudents.map(sid => {
      const faculty = studentMap.get(sid) || 'Science'
      
      // Base profiles for faculties
      let baseD = 5, baseA = 5, baseS = 5
      
      switch (faculty) {
        case 'Engineering':
          baseD = 6; baseA = 7; baseS = 12; // High stress
          break;
        case 'Medicine':
          baseD = 8; baseA = 10; baseS = 14; // Very high stress, high anxiety
          break;
        case 'Arts':
          baseD = 12; baseA = 8; baseS = 6; // Higher depression
          break;
        case 'Business':
          baseD = 4; baseA = 12; baseS = 8; // High anxiety (presentations etc)
          break;
        case 'Science':
        default:
          baseD = 7; baseA = 7; baseS = 7; // Balanced
          break;
      }

      // Semester modifiers
      let multD = 1.0, multA = 1.0, multS = 1.0
      
      if (semester.academic_year === '2566' && semester.semester_name === '1') {
        // Baseline, slightly lower
        multD = 0.8; multA = 0.8; multS = 0.8;
      } else if (semester.academic_year === '2566' && semester.semester_name === '2') {
        // Mid year slump - depression rises overall
        multD = 1.5; multA = 1.1; multS = 1.0;
        // Business gets anxious in term 2
        if (faculty === 'Business') multA = 1.8;
      } else if (semester.academic_year === '2567' && semester.semester_name === '1') {
        // High stress term - Medicine and Engineering get hit hard
        multD = 1.1; multA = 1.2; multS = 1.4;
        if (faculty === 'Engineering' || faculty === 'Medicine') {
          multS = 2.0; 
          multA = 1.5;
        }
      }
      
      // Calculate final with some randomness (+/- 3)
      const randomize = (val: number) => Math.max(0, Math.floor(val) + (Math.floor(Math.random() * 7) - 3))
      
      const d = randomize(baseD * multD)
      const a = randomize(baseA * multA)
      const s = randomize(baseS * multS)
      
      // Random date within semester range
      const start = new Date(semester.start_date).getTime()
      const end = new Date(semester.end_date).getTime()
      const randomTime = start + Math.random() * (end - start)
      const createdAt = new Date(randomTime).toISOString()

      // Randomize EQ as well based loosely on inverse of depression
      const eqScore = 180 - d * 2 + (Math.floor(Math.random() * 30) - 15)

      return {
        student_id: sid,
        term_key: `${semester.academic_year}-T${semester.semester_name}`,
        created_at: createdAt,
        eq_answers: Array(52).fill(0),
        eq_total_score: Math.max(50, Math.min(200, eqScore)),
        dass_answers: Array(21).fill(0),
        dass_depression: { score: d, doubled: d * 2 },
        dass_anxiety: { score: a, doubled: a * 2 },
        dass_stress: { score: s, doubled: s * 2 },
        is_confirmed: true
      }
    })

    const { error } = await supabase.from('assessment_submissions').insert(submissions)
    if (error) console.error(`Error inserting for ${semester.semester_name}/${semester.academic_year}:`, error.message)
  }

  console.log('Mocking complete!')
}

mock().catch(console.error)
