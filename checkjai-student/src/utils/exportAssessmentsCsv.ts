import type { AssessmentListRow } from '../types/assessmentAdmin'

function csvEscape(cell: string): string {
  if (/[",\n\r]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`
  }
  return cell
}

/** Export แถวที่เลือกถ้ามี อย่างน้อย 1 ไอดี — ไม่งั้น export จาก rows ทั้งหมดที่ส่งมา */
export function downloadAssessmentsCsv(
  rows: AssessmentListRow[],
  selectedIds: Set<string>,
) {
  const use =
    selectedIds.size > 0 ? rows.filter((r) => selectedIds.has(r.student_id)) : [...rows]
  const header = [
    'รหัสนักศึกษา',
    'ชื่อ–นามสกุล',
    'คณะ',
    'สาขา',
    'ชั้นปี',
    'วันที่ส่งแบบ',
    'คะแนน EQ รวม',
  ]
  const lines = [header.map(csvEscape).join(',')]
  for (const r of use) {
    const name = r.full_name?.trim() || r.student_id || '-'
    const line = [
      r.student_id ?? '',
      name,
      r.faculty ?? '',
      r.major ?? '',
      r.year_level != null ? String(r.year_level) : '',
      r.latest_submission_at ?? '-',
      r.eq_total_score != null ? String(r.eq_total_score) : '',
    ].map((c) => csvEscape(c))
    lines.push(line.join(','))
  }
  const bom = '\uFEFF'
  const blob = new Blob([bom + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `checkjai-assessments-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
