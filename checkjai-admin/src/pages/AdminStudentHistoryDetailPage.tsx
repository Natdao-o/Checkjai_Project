import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminFetch, clearTeacherSession, getTeacherToken } from '../lib/teacherSession'
import type { StudentHistoryRow, StudentProfileLite } from '../types/assessmentAdmin'
import { DASS21_CHOICES_TH, DASS21_QUESTIONS_TH } from '../lib/dass21Score'
import { EQ_CHOICES_TH, EQ_QUESTIONS_TH } from '../lib/eqQuestions'

type ApiResponse = {
  ok?: boolean
  message?: string
  student?: StudentProfileLite
  history?: StudentHistoryRow[]
}

import { utils, writeFile } from 'xlsx'

function formatMonthYearTh(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('th-TH', {
    month: 'short',
    year: 'numeric',
  })
}

function formatFullDateTh(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function AdminStudentHistoryDetailPage() {
  const navigate = useNavigate()
  const { studentId = '', submissionId = '' } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [student, setStudent] = useState<StudentProfileLite | null>(null)
  const [history, setHistory] = useState<StudentHistoryRow[]>([])

  useEffect(() => {
    if (!getTeacherToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await adminFetch(`/api/admin/students/${encodeURIComponent(studentId)}/history`)
        const json = (await res.json()) as ApiResponse
        if (res.status === 401) {
          clearTeacherSession()
          navigate('/admin/login', { replace: true })
          return
        }
        if (!res.ok || !json.ok) {
          setError(json.message ?? 'โหลดประวัติไม่สำเร็จ')
          return
        }
        if (cancelled) return
        setStudent(json.student ?? null)
        setHistory(json.history ?? [])
      } catch {
        if (!cancelled) setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate, studentId])

  const selected = useMemo(
    () => history.find((h) => h.id === submissionId) ?? history[0] ?? null,
    [history, submissionId],
  )

  const eqAnswers = Array.isArray(selected?.eq_answers) ? selected?.eq_answers ?? [] : []
  const dassAnswers = Array.isArray(selected?.dass_answers) ? selected?.dass_answers ?? [] : []

  const eqPct = Math.max(0, Math.min(100, Math.round(((selected?.eq_total_score ?? 0) / 208) * 100)))
  const depPct = Math.max(
    0,
    Math.min(100, Math.round(((selected?.dass_depression?.doubled ?? 0) / 42) * 100)),
  )
  const anxPct = Math.max(
    0,
    Math.min(100, Math.round(((selected?.dass_anxiety?.doubled ?? 0) / 42) * 100)),
  )
  const strPct = Math.max(
    0,
    Math.min(100, Math.round(((selected?.dass_stress?.doubled ?? 0) / 42) * 100)),
  )

  const mentalDep = Math.max(0, 100 - depPct)
  const mentalAnx = Math.max(0, 100 - anxPct)
  const mentalStr = Math.max(0, 100 - strPct)
  const mentalAvg = Math.round((mentalDep + mentalAnx + mentalStr) / 3)

  const radarAxes = [
    { label: 'EQ', valueEq: eqPct, valueMh: mentalAvg },
    { label: 'Depression', valueEq: eqPct, valueMh: mentalDep },
    { label: 'Anxiety', valueEq: eqPct, valueMh: mentalAnx },
    { label: 'Stress', valueEq: eqPct, valueMh: mentalStr },
  ]
  const radarCenter = 135
  const radarRadius = 90
  const radarEqPoints = radarAxes
    .map((a, idx) => {
      const angle = -Math.PI / 2 + ((Math.PI * 2 * idx) / radarAxes.length)
      const r = (a.valueEq / 100) * radarRadius
      const x = radarCenter + Math.cos(angle) * r
      const y = radarCenter + Math.sin(angle) * r
      return `${x},${y}`
    })
    .join(' ')

  const radarMhPoints = radarAxes
    .map((a, idx) => {
      const angle = -Math.PI / 2 + ((Math.PI * 2 * idx) / radarAxes.length)
      const r = (a.valueMh / 100) * radarRadius
      const x = radarCenter + Math.cos(angle) * r
      const y = radarCenter + Math.sin(angle) * r
      return `${x},${y}`
    })
    .join(' ')

  const handleExportExcel = () => {
    if (!selected) return

    const wb = utils.book_new()

    // 1. Sheet "Summary"
    const summaryData = [
      ['ข้อมูลนักศึกษา'],
      ['รหัสนักศึกษา', student?.student_id ?? studentId],
      ['ชื่อ-นามสกุล', student?.full_name ?? '-'],
      ['คณะ', student?.faculty?.trim() || '-'],
      ['สาขา', student?.major?.trim() || '-'],
      ['ชั้นปี', student?.year_level ?? '-'],
      ['วันที่ทำแบบทดสอบ', formatFullDateTh(selected.created_at)],
      [''],
      ['สรุปผลคะแนน'],
      ['DASS-21 - ซึมเศร้า', `${selected.dass_depression?.doubled ?? 0} (${selected.dass_depression?.labelTh ?? '-'})`],
      ['DASS-21 - วิตกกังวล', `${selected.dass_anxiety?.doubled ?? 0} (${selected.dass_anxiety?.labelTh ?? '-'})`],
      ['DASS-21 - ความเครียด', `${selected.dass_stress?.doubled ?? 0} (${selected.dass_stress?.labelTh ?? '-'})`],
      ['EQ รวม', `${selected.eq_total_score ?? 0} / 208`],
      ['สุขภาพจิตใจรวม (Mental Wellbeing)', `${mentalAvg} / 100`],
    ]
    const wsSummary = utils.aoa_to_sheet(summaryData)
    utils.book_append_sheet(wb, wsSummary, 'สรุปผล')

    // 2. Sheet "Detailed Answers"
    const detailsData = [
      ['ข้อที่', 'หมวดหมู่', 'คำถาม', 'คะแนน', 'คำตอบ'],
    ]

    // DASS Answers
    DASS21_QUESTIONS_TH.forEach((q, idx) => {
      const score = dassAnswers[idx] ?? 0
      const ans = typeof dassAnswers[idx] === 'number' ? DASS21_CHOICES_TH[dassAnswers[idx] ?? 0] : '-'
      detailsData.push([idx + 1, 'DASS-21', q, score, ans])
    })

    // EQ Answers
    EQ_QUESTIONS_TH.forEach((q, idx) => {
      const score = eqAnswers[idx] ?? 0
      const ans = typeof eqAnswers[idx] === 'number' ? EQ_CHOICES_TH[eqAnswers[idx] ?? 0] : '-'
      detailsData.push([idx + 1, 'EQ', q, score, ans])
    })

    const wsDetails = utils.aoa_to_sheet(detailsData)
    utils.book_append_sheet(wb, wsDetails, 'คำตอบโดยละเอียด')

    // Download
    const fileName = `Assessment_${studentId}_${selected.created_at.split('T')[0]}.xlsx`
    writeFile(wb, fileName)
  }

  return (
    <div className="aj-historyPage">
      <header className="aj-searchHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="aj-searchTitle">Search</h1>
          <p className="aj-searchCrumb">
            <button type="button" className="aj-searchCrumbLink" onClick={() => navigate('/admin/search')}>
              Search
            </button>
            {' > '}
            <button
              type="button"
              className="aj-searchCrumbLink"
              onClick={() => navigate(`/admin/search/${encodeURIComponent(studentId)}/history`)}
            >
              History
            </button>
            {' > Detail'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportExcel}
          className="aj-searchBtnExport"
        >
          📊 Export Excel
        </button>
      </header>

      {error ? <p className="aj-searchBanner">{error}</p> : null}

      <section className="aj-historyProfile">
        <h2 className="aj-historyName">
          {student?.student_id ?? studentId} {student?.full_name ? ` ${student.full_name}` : ''}
        </h2>
        <p>รหัสนักศึกษา : {student?.student_id ?? studentId}</p>
        <p>คณะ : {student?.faculty?.trim() || '-'}</p>
        <p>เดือน / ปี : {selected?.created_at ? formatMonthYearTh(selected.created_at) : '-'}</p>
        <p>ชั้นปี : {student?.year_level != null ? student.year_level : '-'}</p>
        <p>สาขา : {student?.major?.trim() || '-'}</p>
      </section>

      {loading ? (
        <p className="aj-searchTdMuted">กำลังโหลด...</p>
      ) : !selected ? (
        <p className="aj-searchTdMuted">ไม่พบรายการที่เลือก</p>
      ) : (
        <>
          <div className="aj-historyChartCard">
            <h3>ข้อมูลเชิงลึก</h3>
            <svg viewBox="0 0 270 270" className="aj-radarSvg" aria-label="กราฟสรุปคะแนน">
              {[1, 2, 3, 4, 5].map((n) => {
                const rr = (radarRadius * n) / 5
                const points = radarAxes
                  .map((_, idx) => {
                    const angle = -Math.PI / 2 + ((Math.PI * 2 * idx) / radarAxes.length)
                    const x = radarCenter + Math.cos(angle) * rr
                    const y = radarCenter + Math.sin(angle) * rr
                    return `${x},${y}`
                  })
                  .join(' ')
                return <polygon key={n} points={points} fill="none" stroke="rgba(35, 46, 122, 0.24)" strokeWidth="1" />
              })}
              {radarAxes.map((a, idx) => {
                const angle = -Math.PI / 2 + ((Math.PI * 2 * idx) / radarAxes.length)
                const x = radarCenter + Math.cos(angle) * radarRadius
                const y = radarCenter + Math.sin(angle) * radarRadius
                const lx = radarCenter + Math.cos(angle) * (radarRadius + 20)
                const ly = radarCenter + Math.sin(angle) * (radarRadius + 20)
                return (
                  <g key={a.label}>
                    <line x1={radarCenter} y1={radarCenter} x2={x} y2={y} stroke="rgba(35,46,122,.35)" />
                    <text x={lx} y={ly} textAnchor="middle" className="aj-radarLabel">
                      {a.label}
                    </text>
                  </g>
                )
              })}
              <polygon points={radarEqPoints} fill="rgba(229, 88, 183, 0.33)" stroke="#ce4ea8" strokeWidth="2" />
              <polygon points={radarMhPoints} fill="rgba(81, 204, 226, 0.40)" stroke="#2aa6c2" strokeWidth="2" />
            </svg>
            <div className="aj-radarLegend2">
              <p><span className="aj-radarLegendDot aj-radarLegendDot--eq" /> แบบทดสอบทางอารมณ์ (EQ)</p>
              <p><span className="aj-radarLegendDot aj-radarLegendDot--mh" /> แบบทดสอบสุขภาพจิตใจ (DASS-21)</p>
            </div>
          </div>

          <div className="aj-historyMetaScore">
            <p>
              <strong>DASS-21</strong>: ซึมเศร้า {selected?.dass_depression?.labelTh ?? '-'} / วิตกกังวล {selected?.dass_anxiety?.labelTh ?? '-'} / เครียด {selected?.dass_stress?.labelTh ?? '-'}
            </p>
            <p>
              <strong>EQ รวม</strong>: {selected?.eq_total_score ?? '-'} / 208
            </p>
            <p>
              <strong>สุขภาพจิตใจ (กลับแกนจาก DASS)</strong>: {mentalAvg} / 100
            </p>
          </div>

          <div className="aj-answerBlock">
            <h3 className="aj-historyItemTitle">แบบทดสอบสุขภาพจิต DASS-21</h3>
            <table className="aj-answerTable">
              <thead>
                <tr>
                  <th>คำถาม</th>
                  <th>คำตอบ</th>
                </tr>
              </thead>
              <tbody>
                {DASS21_QUESTIONS_TH.map((q, idx) => {
                  const ans = typeof dassAnswers[idx] === 'number' ? DASS21_CHOICES_TH[dassAnswers[idx] ?? 0] : '-'
                  return (
                    <tr key={`dass-${idx + 1}`}>
                      <td>{idx + 1}. {q}</td>
                      <td>{ans}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="aj-answerBlock">
            <h3 className="aj-historyItemTitle">แบบทดสอบความฉลาดทางอารมณ์ EQ</h3>
            <table className="aj-answerTable">
              <thead>
                <tr>
                  <th>คำถาม</th>
                  <th>คำตอบ</th>
                </tr>
              </thead>
              <tbody>
                {EQ_QUESTIONS_TH.map((q, idx) => {
                  const ans = typeof eqAnswers[idx] === 'number' ? EQ_CHOICES_TH[eqAnswers[idx] ?? 0] : '-'
                  return (
                    <tr key={`eq-${idx + 1}`}>
                      <td>{idx + 1}. {q}</td>
                      <td>{ans}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
