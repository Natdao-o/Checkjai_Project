import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  adminFetch,
  getTeacherToken,
  clearTeacherSession,
} from '../lib/teacherSession'
import { downloadAssessmentsCsv } from '../utils/exportAssessmentsCsv'
import type { AssessmentListRow } from '../types/assessmentAdmin'


function buildMonthYearDropdown(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 36; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const cy = d.getFullYear()
    const cm = d.getMonth() + 1
    const value = `${cy}-${String(cm).padStart(2, '0')}`
    const label = d.toLocaleDateString('th-TH', {
      month: 'long',
      year: 'numeric',
    })
    out.push({ value, label })
  }
  return out
}

export default function AdminSearchPage() {
  const navigate = useNavigate()

  const [studentQ, setStudentQ] = useState('')
  const [faculty, setFaculty] = useState('')
  const [major, setMajor] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [status, setStatus] = useState('')

  const [faculties, setFaculties] = useState<string[]>([])
  const [majors, setMajors] = useState<string[]>([])
  const [yearLevels, setYearLevels] = useState<number[]>([])

  const [rows, setRows] = useState<AssessmentListRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 50

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)

  const [sort, setSort] = useState<
    'id' | 'name' | 'faculty' | 'major' | 'year' | 'status'
  >('id')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  const [selected, setSelected] = useState<Set<string>>(new Set())

  const loadMeta = useCallback(async () => {
    const res = await adminFetch('/api/admin/meta')
    if (res.status === 401) {
      clearTeacherSession()
      navigate('/admin/login', { replace: true })
      return
    }
    const json = (await res.json()) as {
      ok?: boolean
      faculties?: string[]
      majors?: string[]
      years?: number[]
    }
    if (res.ok && json.ok) {
      setFaculties(json.faculties ?? [])
      setMajors(json.majors ?? [])
      setYearLevels(json.years ?? [])
    }
  }, [navigate])

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams()
    if (studentQ.trim()) p.set('q', studentQ.trim())
    if (faculty) p.set('faculty', faculty)
    if (major) p.set('major', major)
    if (yearLevel) p.set('year_level', yearLevel)
    if (status) p.set('status', status)
    p.set('page', String(page))
    p.set('limit', String(limit))
    p.set('sort', sort === 'id' ? 'student_id' : sort)
    p.set('order', order)
    return p.toString()
  }, [studentQ, faculty, major, yearLevel, sort, order])

  const runSearch = useCallback(async () => {
    setError(null)
    setConfigError(null)
    setLoading(true)
    try {
      const qs = buildQuery()
      const res = await adminFetch(`/api/admin/assessments?${qs}`)
      const json = (await res.json()) as {
        ok?: boolean
        message?: string
        rows?: AssessmentListRow[]
        total?: number
      }
      if (res.status === 401) {
        clearTeacherSession()
        navigate('/admin/login', { replace: true })
        return
      }
      if (res.status === 503) {
        setConfigError(json.message ?? 'ยังตั้งค่า service role ไม่ครบ')
        setRows([])
        return
      }
      if (!res.ok || !json.ok) {
        setError(json.message ?? 'โหลดข้อมูลไม่สำเร็จ')
        setRows([])
        return
      }
      setRows(json.rows ?? [])
      setTotalCount(json.total ?? 0)
      setSelected(new Set())
    } catch {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [buildQuery, navigate])

  const runSearchRef = useRef(runSearch)
  runSearchRef.current = runSearch

  useEffect(() => {
    if (!getTeacherToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    let cancelled = false
    ;(async () => {
      await loadMeta()
      if (cancelled) return
      await runSearchRef.current()
    })()
    return () => {
      cancelled = true
    }
  }, [navigate, loadMeta, page])

  const skipSortEffectOnce = useRef(true)
  useEffect(() => {
    if (!getTeacherToken()) return
    if (skipSortEffectOnce.current) {
      skipSortEffectOnce.current = false
      return
    }
    void runSearchRef.current()
  }, [sort, order])

  function resetFilters() {
    flushSync(() => {
      setStudentQ('')
      setFaculty('')
      setYearLevel('')
      setStatus('')
      setPage(1)
      setSort('id')
      setOrder('asc')
    })
    void runSearch()
  }


  function toggleSort(
    key: 'id' | 'name' | 'faculty' | 'major' | 'year' | 'status',
  ) {
    if (sort === key) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSort(key)
      setOrder('asc')
    }
  }

  const allSelected =
    rows.length > 0 && rows.every((r) => selected.has(r.student_id))

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(rows.map((r) => r.student_id)))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function displayName(r: AssessmentListRow) {
    const n = r.full_name?.trim()
    if (n) return n
    if (r.student_id) return r.student_id
    return '—'
  }

  function goToHistory(r: AssessmentListRow) {
    const sid = (r.student_id ?? '').trim()
    if (!sid) return
    navigate(`/admin/search/${encodeURIComponent(sid)}/history`)
  }

  return (
    <div className="aj-searchPage aj-admin-theme">
      <header className="aj-searchHeader">
        <h1 className="aj-searchTitle">Student Directory</h1>
        <p className="aj-searchCrumb">
          Admin &gt; Search
        </p>
      </header>

      {configError ? (
        <p className="aj-searchBanner" role="alert">
          {configError} — เพิ่ม `SUPABASE_SERVICE_ROLE_KEY` ในไฟล์ `.env` ของ
          back-end แล้วรีสตาร์ท API
        </p>
      ) : null}

      <section className="aj-searchPanel">
        <div className="aj-searchGrid">
          <label className="aj-searchField">
            <span>รหัสนักศึกษา</span>
            <input
              type="text"
              value={studentQ}
              onChange={(e) => setStudentQ(e.target.value)}
              placeholder="ค้นหารหัสหรือชื่อ"
              className="aj-searchInput"
            />
          </label>
          <label className="aj-searchField">
            <span>ชั้นปี</span>
            <select
              className="aj-searchSelect"
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={String(y)}>
                  ปีที่ {y}
                </option>
              ))}
              {yearLevels
                .filter((y) => !([1, 2, 3, 4] as number[]).includes(y))
                .map((y) => (
                  <option key={y} value={String(y)}>
                    ปีที่ {y}
                  </option>
                ))}
            </select>
          </label>
          <label className="aj-searchField">
            <span>คณะ</span>
            <select
              className="aj-searchSelect"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="aj-searchField">
            <span>สาขา</span>
            <select
              className="aj-searchSelect"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              {majors.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="aj-searchField">
            <span>สถานะ</span>
            <select
              className="aj-searchSelect"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">ทั้งหมด</option>
              <option value="Submitted">ทำแล้ว</option>
              <option value="Pending">ยังไม่ทำ</option>
            </select>
          </label>
        </div>
        <div className="aj-searchActions">
          <button
            type="button"
            className="aj-searchBtnReset"
            onClick={resetFilters}
          >
            Reset
          </button>
          <button
            type="button"
            className="aj-searchBtnPrimary"
            onClick={() => void runSearch()}
            disabled={loading}
          >
            Search
          </button>
        </div>
      </section>

      <section className="aj-searchPanel aj-searchPanel--table">
        <div className="aj-searchTableBar">
          <button
            type="button"
            className="aj-searchBtnExport"
            onClick={() => downloadAssessmentsCsv(rows, selected)}
            disabled={rows.length === 0}
          >
            Export
          </button>
        </div>

        {error ? <p className="aj-searchError">{error}</p> : null}

        <div className="aj-searchTableWrap">
          <table className="aj-searchTable">
            <thead>
              <tr>
                <th className="aj-searchThCheck">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="เลือกทั้งหมด"
                  />
                </th>
                <th>
                  <button
                    type="button"
                    className="aj-sortBtn"
                    onClick={() => toggleSort('id')}
                  >
                    รหัสนักศึกษา
                    {sort === 'id' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="aj-sortBtn"
                    onClick={() => toggleSort('name')}
                  >
                    ชื่อ - นามสกุล
                    {sort === 'name' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="aj-sortBtn"
                    onClick={() => toggleSort('faculty')}
                  >
                    คณะ
                    {sort === 'faculty' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="aj-sortBtn"
                    onClick={() => toggleSort('status')}
                  >
                    สถานะ
                    {sort === 'status' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                </th>
                <th style={{ textAlign: 'center' }}>EQ</th>
                <th style={{ textAlign: 'center' }}>Depression</th>
                <th style={{ textAlign: 'center' }}>Anxiety</th>
                <th style={{ textAlign: 'center' }}>Stress</th>
                <th>ประวัติ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="aj-searchTdMuted">
                    กำลังโหลด…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="aj-searchTdMuted">
                    ไม่มีข้อมูล (หรือยังไม่มี student_profiles)
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.student_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(r.student_id)}
                        onChange={() => toggleOne(r.student_id)}
                        aria-label={`เลือก ${displayName(r)}`}
                      />
                    </td>
                    <td>{r.student_id}</td>
                    <td>{displayName(r)}</td>
                    <td>{r.faculty?.trim() || '—'}</td>
                    <td>
                      <span className={`aj-statusBadge aj-statusBadge--${r.status.toLowerCase()}`}>
                        {r.status === 'Submitted' ? 'ทำแล้ว' : 'ยังไม่ทำ'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>
                      {r.eq_total_score ?? '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.latest_depression_score ?? '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.latest_anxiety_score ?? '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.latest_stress_score ?? '-'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="aj-searchLinkBtn"
                        onClick={() => goToHistory(r)}
                      >
                        ดูประวัติ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="aj-pagination">
          <div className="aj-paginationInfo">
            แสดง {rows.length} จาก {totalCount} รายการ (หน้า {page} จาก {Math.ceil(totalCount / limit) || 1})
          </div>
          <div className="aj-paginationBtns">
            <button
              type="button"
              className="aj-paginationBtn"
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => p - 1)}
            >
              &lt; ก่อนหน้า
            </button>
            <button
              type="button"
              className="aj-paginationBtn"
              disabled={page >= Math.ceil(totalCount / limit) || loading}
              onClick={() => setPage(p => p + 1)}
            >
              ถัดไป &gt;
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
