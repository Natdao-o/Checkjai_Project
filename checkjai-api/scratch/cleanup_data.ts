import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function cleanup() {
  console.log('Starting cleanup...')

  const targetStudentId = '6652100584'

  // 1. Delete all bubble letters
  console.log('Deleting bubble_letters...')
  const { error: err1 } = await supabase.from('bubble_letters').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (err1) console.error('Error deleting bubble_letters:', err1)
  else console.log('Deleted bubble_letters')

  // 2. Delete all assessment submissions
  console.log('Deleting assessment_submissions...')
  const { error: err2 } = await supabase.from('assessment_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (err2) console.error('Error deleting assessment_submissions:', err2)
  else console.log('Deleted assessment_submissions')

  // 3. Delete all student profiles except the specified one
  console.log(`Deleting student_profiles except ${targetStudentId}...`)
  const { error: err3 } = await supabase.from('student_profiles').delete().neq('student_id', targetStudentId)
  if (err3) console.error('Error deleting student_profiles:', err3)
  else console.log(`Deleted student_profiles (except ${targetStudentId})`)

  console.log('Cleanup finished.')
}

cleanup()
