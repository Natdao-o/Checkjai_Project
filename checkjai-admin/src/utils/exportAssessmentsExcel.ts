import * as XLSX from 'xlsx'
import type { AssessmentListRow } from '../types/assessmentAdmin'

/** Export รายการที่เลือกหรือทั้งหมดเป็นไฟล์ Excel (.xlsx) ที่ดูเป็นมืออาชีพ */
export function downloadAssessmentsExcel(
  rows: AssessmentListRow[],
  selectedIds: Set<string>,
) {
  const use = selectedIds.size > 0 
    ? rows.filter((r) => selectedIds.has(r.student_id)) 
    : [...rows]

  const data = use.map(r => ({
    'รหัสนักศึกษา': r.student_id ?? '',
    'ชื่อ–นามสกุล': r.full_name?.trim() || r.student_id || '-',
    'คณะ': r.faculty ?? '',
    'สาขาวิชา': r.major ?? '',
    'ชั้นปี': r.year_level != null ? `ปี ${r.year_level}` : '',
    'วันเวลาที่ส่ง': r.latest_submission_at ? new Date(r.latest_submission_at).toLocaleString('th-TH') : '-',
    'คะแนน EQ': r.eq_total_score ?? '-',
    'Depression': r.latest_depression_score ?? '-',
    'Anxiety': r.latest_anxiety_score ?? '-',
    'Stress': r.latest_stress_score ?? '-'
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  
  // กำหนดความกว้างคอลัมน์ให้ดูสวยงาม
  ws['!cols'] = [
    { wch: 15 }, // รหัสนักศึกษา
    { wch: 25 }, // ชื่อ-นามสกุล
    { wch: 30 }, // คณะ
    { wch: 30 }, // สาขา
    { wch: 10 }, // ชั้นปี
    { wch: 20 }, // วันเวลาที่ส่ง
    { wch: 12 }, // EQ
    { wch: 15 }, // D
    { wch: 15 }, // A
    { wch: 15 }  // S
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'รายงานผลการประเมิน')
  
  const fileName = `CheckJai-Reports-${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.xlsx`
  XLSX.writeFile(wb, fileName)
}
