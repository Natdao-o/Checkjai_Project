export type AssessmentListRow = {
  student_id: string
  full_name: string | null
  faculty: string | null
  major: string | null
  year_level: number | null
  latest_submission_id?: string | null
  latest_submission_at?: string | null
  eq_total_score?: number | null
  latest_depression_score?: string | null
  latest_anxiety_score?: string | null
  latest_stress_score?: string | null
  status: 'Submitted' | 'Pending'
}

export type StudentProfileLite = {
  student_id: string
  full_name: string | null
  faculty: string | null
  major: string | null
  year_level: number | null
}

export type StudentHistoryRow = {
  id: string
  created_at: string
  eq_total_score: number | null
  eq_answers?: number[] | null
  dass_answers?: number[] | null
  dass_depression?: { raw?: number; doubled?: number; labelTh?: string } | null
  dass_anxiety?: { raw?: number; doubled?: number; labelTh?: string } | null
  dass_stress?: { raw?: number; doubled?: number; labelTh?: string } | null
}

export type BubbleLetterRow = {
  id: string
  content: string
  created_at: string
}
