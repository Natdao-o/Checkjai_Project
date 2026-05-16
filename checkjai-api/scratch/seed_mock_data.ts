import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import { calculateDass21 } from '../server/lib/dass21Score'
import { calculateEqTotal } from '../server/lib/eqScore'

const supabaseUrl = process.env.SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, serviceRoleKey)

const FACULTIES = [
  'คณะวิศวกรรมศาสตร์และเทคโนโลยี',
  'คณะบริหารธุรกิจ',
  'คณะศิลปศาสตร์'
]

const MAJORS_BY_FACULTY: Record<string, string[]> = {
  'คณะวิศวกรรมศาสตร์และเทคโนโลยี': ['เทคโนโลยีดิจิทัลและสารสนเทศ', 'วิศวกรรมหุ่นยนต์และระบบอัตโนมัติ'],
  'คณะบริหารธุรกิจ': ['การจัดการธุรกิจการค้าสมัยใหม่', 'บริหารธุรกิจ (การจัดการโลจิสติกส์)'],
  'คณะศิลปศาสตร์': ['ภาษาจีนธุรกิจ', 'ภาษาญี่ปุ่นธุรกิจ']
}

const FIRST_NAMES = [
  'สมชาย', 'สมหญิง', 'อาทิตย์', 'จันทรา', 'เกรียงไกร', 'พรรณิภา', 'วีระ', 'นงลักษณ์', 'ชูชาติ', 'สุดา',
  'กิตติ', 'สิริ', 'นพดล', 'พรทิพย์', 'ชัยพล', 'วาสนา', 'พิชัย', 'อารี', 'อุดม', 'สุนิสา',
  'กมล', 'ธัญญา', 'เอกชัย', 'รัตนา', 'วิศรุต', 'กาญจนา', 'ธีระ', 'ภัทรา', 'วรวุฒิ', 'มาลี',
  'ณัฐวุฒิ', 'ศิริรัตน์', 'อานนท์', 'มณี', 'ธนพล', 'ลัดดา', 'สุรชัย', 'สมพร', 'วิทูรย์', 'ยุพา',
  'ปกรณ์', 'วรัญญา', 'ธนากร', 'ศศิธร', 'พีรพล', 'กัญญารัตน์', 'จิรวัฒน์', 'ศิริพร', 'มนัส', 'อัญชลี'
]

const LAST_NAMES = [
  'ใจดี', 'รักสงบ', 'ก้าวหน้า', 'มั่งคั่ง', 'สุขใจ', 'รุ่งเรือง', 'โชคดี', 'ศรีนวล', 'ทองแท้', 'เลิศล้ำ',
  'มีสุข', 'สมหวัง', 'อริยะ', 'พูนผล', 'มั่นคง', 'ยืนยง', 'รอดพ้น', 'ปัญญา', 'เจริญ', 'รักษ์ไทย',
  'งามเลิศ', 'ขยัน', 'อดทน', 'พอเพียง', 'ประณีต', 'บุญชู', 'ดวงดี', 'ช่างกล', 'รักษา', 'นิยม',
  'มั่นวิจิตร', 'พานิช', 'กิจรุ่งเรือง', 'ศิริวัฒน์', 'วงศ์สุวรรณ', 'เลิศปัญญา', 'ไทยอนันต์', 'แสงทอง', 'วัฒนา', 'ศรีสุข'
]

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateThaiName() {
  return `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`
}

function generateStudentId(index: number) {
  const year = 66
  return `${year}5210${String(index + 1).padStart(4, '0')}`
}

function generateDassAnswers(profile: 'high' | 'medium' | 'low') {
  const answers = new Array(21).fill(0)
  for (let i = 0; i < 21; i++) {
    if (profile === 'high') {
      // High Stress: mix of 1, 2, 3 -> aim for severe/moderate
      const r = Math.random()
      answers[i] = r > 0.4 ? 2 : r > 0.1 ? 1 : 0
    } else if (profile === 'medium') {
      // Medium Stress: mostly 0, 1 -> aim for mild/normal
      const r = Math.random()
      answers[i] = r > 0.8 ? 2 : r > 0.3 ? 1 : 0
    } else {
      // Low Stress: mostly 0 -> normal
      answers[i] = Math.random() > 0.95 ? 1 : 0
    }
  }
  return answers
}

function generateEqAnswers() {
  const answers = new Array(52).fill(0)
  for (let i = 0; i < 52; i++) {
    answers[i] = Math.floor(Math.random() * 2) + Math.floor(Math.random() * 2) // biased towards center
  }
  return answers
}

async function seed() {
  console.log('Seeding mock data...')

  const existingStudentId = '6652100584'
  const totalStudentsTarget = 120
  
  const studentProfiles: any[] = []
  const assessmentSubmissions: any[] = []

  const terms = [
    { key: '2025-T1', date: '2025-08-15T10:00:00Z' },
    { key: '2025-T2', date: '2026-01-20T14:30:00Z' }
  ]

  for (let i = 0; i < totalStudentsTarget; i++) {
    const isExisting = i === 0 
    const studentId = isExisting ? existingStudentId : generateStudentId(i + 100)
    
    const faculty = FACULTIES[Math.floor(i / 40)]
    const majorList = MAJORS_BY_FACULTY[faculty]
    const major = majorList[Math.floor((i % 40) / 20)]
    
    if (!isExisting) {
      studentProfiles.push({
        student_id: studentId,
        full_name: generateThaiName(),
        faculty: faculty,
        major: major,
        year_level: Math.floor(Math.random() * 4) + 1
      })
    } else {
      await supabase.from('student_profiles').update({
        faculty,
        major,
        year_level: Math.floor(Math.random() * 4) + 1
      }).eq('student_id', studentId)
    }

    let stressProfile: 'high' | 'medium' | 'low' = 'low'
    if (faculty === 'คณะวิศวกรรมศาสตร์และเทคโนโลยี') stressProfile = 'high'
    else if (faculty === 'คณะบริหารธุรกิจ') stressProfile = 'medium'

    for (const term of terms) {
      const dassAnswers = generateDassAnswers(stressProfile)
      const eqAnswers = generateEqAnswers()
      
      const dr = calculateDass21(dassAnswers)
      const eq = calculateEqTotal(eqAnswers)

      assessmentSubmissions.push({
        student_id: studentId,
        term_key: term.key,
        created_at: term.date,
        eq_answers: eqAnswers,
        eq_total_score: eq.total,
        dass_answers: dassAnswers,
        dass_depression: dr.depression,
        dass_anxiety: dr.anxiety,
        dass_stress: dr.stress
      })
    }
  }

  if (studentProfiles.length > 0) {
    console.log(`Inserting ${studentProfiles.length} new student profiles...`)
    const { error: spErr } = await supabase.from('student_profiles').insert(studentProfiles)
    if (spErr) {
      console.error('Error seeding student_profiles:', spErr)
      return
    }
  }

  console.log(`Inserting ${assessmentSubmissions.length} assessment records...`)
  for (let i = 0; i < assessmentSubmissions.length; i += 50) {
    const chunk = assessmentSubmissions.slice(i, i + 50)
    const { error: asErr } = await supabase.from('assessment_submissions').insert(chunk)
    if (asErr) {
      console.error('Error seeding assessment_submissions chunk:', asErr)
      return
    }
  }

  console.log('Mock data seeding finished successfully.')
}

seed()
