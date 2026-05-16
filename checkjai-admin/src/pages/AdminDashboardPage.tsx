import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminFetch, clearTeacherSession, getTeacherToken } from '../lib/teacherSession'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts'
import '../../src/style.css'

type DashboardStats = {
  totalSubmissions: number
  avgScores: { d: number; a: number; s: number; eq: number }
  distribution: { name: string; value: number }[]
  trends: { name: string; Depression: number; Anxiety: number; Stress: number }[]
  topFaculty: string
  facultyAverages?: { name: string; Depression: number; Anxiety: number; Stress: number }[]
  riskStudents?: {
    student_id: string
    full_name: string
    faculty: string
    status: string
    d_score: number
    a_score: number
    s_score: number
  }[]
}

type Semester = { id: string; semester_name: string; academic_year: string; is_active: boolean }

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#b91c1c', '#7f1d1d']

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [faculties, setFaculties] = useState<string[]>([])
  
  const [loading, setLoading] = useState(false)
  const [semesterId, setSemesterId] = useState('')
  const [faculty, setFaculty] = useState('')

  const loadMeta = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        adminFetch('/api/admin/semesters'),
        adminFetch('/api/admin/meta')
      ])
      const sJson = await sRes.json()
      const mJson = await mRes.json()
      if (sJson.ok) {
        setSemesters(sJson.semesters)
        if (!semesterId && sJson.semesters.length > 0) {
          setSemesterId(sJson.semesters[0].id)
        }
      }
      if (mJson.ok) setFaculties(mJson.faculties)
    } catch (e) {}
  }

  const loadStats = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (semesterId) qs.set('semester_id', semesterId)
      if (faculty) qs.set('faculty', faculty)

      const res = await adminFetch(`/api/admin/dashboard/stats?${qs.toString()}`)
      const json = await res.json()
      if (res.status === 401) {
        clearTeacherSession()
        navigate('/admin/login', { replace: true })
        return
      }
      if (res.ok && json.ok) {
        setStats(json.stats)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!getTeacherToken()) {
      navigate('/admin/login', { replace: true })
      return
    }
    void loadMeta()
    if (semesterId) {
      void loadStats()
    }
  }, [navigate, semesterId, faculty])

  return (
    <div className="aj-searchPage aj-admin-theme">
      <header className="aj-searchHeader">
        <h1 className="aj-searchTitle">Dashboard</h1>
      </header>

      {/* Filters Bar */}
      <section className="aj-searchPanel" style={{ marginBottom: '24px' }}>
        <div className="aj-searchGrid">
          <label className="aj-searchField">
            <span>เลือกปีการศึกษา / เทอม</span>
            <select value={semesterId} onChange={(e) => setSemesterId(e.target.value)} className="aj-searchSelect">
              {semesters.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  {s.semester_name}/{s.academic_year} {idx === 0 ? '(Latest)' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="aj-searchField">
            <span>คณะ / วิทยาลัย</span>
            <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className="aj-searchSelect">
              <option value="">แสดงทั้งหมด</option>
              {faculties.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        </div>
      </section>

      {/* Metric Cards */}
      <div className="aj-dashGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="aj-searchPanel" style={{ margin: 0, padding: '30px', borderLeft: '6px solid #334155' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>จำนวนนักศึกษาที่คัดกรองแล้ว</p>
          <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>{stats?.totalSubmissions ?? 0} <small style={{ fontSize: '18px', fontWeight: 400 }}>คน</small></h2>
        </div>
        <div className="aj-searchPanel" style={{ margin: 0, padding: '30px', borderLeft: '6px solid #10b981' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ระดับความเครียดเฉลี่ย (Stress)</p>
          <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>{stats?.avgScores?.s.toFixed(1) ?? '0.0'}</h2>
        </div>
        <div className="aj-searchPanel" style={{ margin: 0, padding: '30px', borderLeft: '6px solid #ef4444' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>คณะที่มีความเสี่ยงสูงที่สุด</p>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#991b1b', marginTop: '10px' }}>{stats?.topFaculty ?? '-'}</h2>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        
        {/* Trend Chart (Historical Comparison) */}
        <section className="aj-searchPanel" style={{ margin: 0, height: '480px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#1e293b' }}>แนวโน้มสุขภาพจิตรายเทอม (Historical Trend)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={stats?.trends ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} tickMargin={12} />
              <YAxis fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend verticalAlign="top" height={40} iconType="circle" />
              <Line type="monotone" dataKey="Depression" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Anxiety" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Stress" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Risk Level Distribution (Pie Chart) */}
        <section className="aj-searchPanel" style={{ margin: 0, height: '480px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#1e293b' }}>สัดส่วนกลุ่มเสี่ยง (Risk Distribution)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={stats?.distribution ?? []}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={8}
                dataKey="value"
                label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
              >
                {stats?.distribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={40} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </section>

        {/* Faculty Comparison (Bar Chart) */}
        <section className="aj-searchPanel" style={{ margin: 0, height: '480px', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#1e293b' }}>เปรียบเทียบคะแนนเฉลี่ยแยกตามคณะ (Faculty Comparison)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={stats?.facultyAverages ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Legend verticalAlign="top" height={40} />
              <Bar dataKey="Depression" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Anxiety" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Stress" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Risk Students Table */}
      <section className="aj-searchPanel" style={{ margin: 0, marginTop: '24px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: '#1e293b' }}>
          รายชื่อนักศึกษากลุ่มเสี่ยง (Risk Students)
        </h3>
        
        {!stats?.riskStudents || stats.riskStudents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            ไม่พบนักศึกษาในกลุ่มเสี่ยงในฟิลเตอร์ที่เลือก
          </div>
        ) : (
          <table className="aj-searchTable">
            <thead>
              <tr>
                <th>รหัสนักศึกษา</th>
                <th>ชื่อ-นามสกุล</th>
                <th>คณะ</th>
                <th>ความเครียด (D/A/S)</th>
                <th>สถานะความเสี่ยง</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {stats.riskStudents.map((student) => (
                <tr key={student.student_id}>
                  <td>{student.student_id}</td>
                  <td>{student.full_name}</td>
                  <td>{student.faculty}</td>
                  <td style={{ color: '#64748b' }}>
                    {student.d_score} / {student.a_score} / {student.s_score}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: 600,
                      backgroundColor: student.status.includes('High Risk') ? '#fee2e2' : '#fef3c7',
                      color: student.status.includes('High Risk') ? '#991b1b' : '#92400e',
                    }}>
                      {student.status.includes('High Risk') ? '🔴 ' : '🟡 '}
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/search/${student.student_id}/history`)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      ดูประวัติ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
           <div style={{ padding: '20px 40px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 700, color: '#1e293b' }}>
             กำลังดึงข้อมูล Analytics...
           </div>
        </div>
      )}
    </div>
  )
}
