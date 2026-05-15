import { useState, useEffect } from 'react'

import TopBar from '../components/TopBar'
import { getStudentId } from '../lib/auth'
import profileImg from '../assets/images/รูปโปรไฟล์ข้อมูลส่วนตัว.png'
import { API_URL } from '../lib/apiConfig'

const fields = [
  { key: 'full_name', label: 'ชื่อผู้ใช้ :', type: 'text', autoComplete: 'name' },
  { key: 'student_id', label: 'รหัสประจำตัวนักศึกษา :', type: 'text', autoComplete: 'off' },
  { key: 'faculty', label: 'คณะ :', type: 'text', autoComplete: 'organization' },
  { key: 'major', label: 'สาขา / วิชา :', type: 'text', autoComplete: 'off' },
  { key: 'year_level', label: 'ชั้นปีที่ศึกษา :', type: 'text', autoComplete: 'off' },
] as const

export default function ProfilePage() {
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, ''])),
  )

  useEffect(() => {
    async function fetchProfile() {
      const studentId = getStudentId()
      if (!studentId) return

      try {
        const res = await fetch(`${API_URL}/api/auth/me?student_id=${studentId}`)
        const json = await res.json()

        if (json.ok) {
          setForm({
            full_name: json.full_name || '',
            student_id: json.student_id || studentId,
            faculty: json.faculty || '',
            major: json.major || '',
            year_level: json.year_level != null ? String(json.year_level) : '',
          })
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      }
    }

    fetchProfile()
  }, [])

  return (
    <div className="cj-home cj-home--profile bg-[#fce7f3] min-h-screen">
      <TopBar />

      <main className="cj-profileMain">
        <section className="cj-profileHead">
          <span className="cj-profileHeadBar" aria-hidden="true" />
          <h1>ข้อมูลส่วนตัว</h1>
        </section>

        <section className="cj-profileCard">
          <div className="cj-profileCardTop">
            <div className="cj-profileAvatar" aria-hidden="true">
              <img src={profileImg} alt="Profile" className="cj-profileRabbit" />
            </div>
            <div className="cj-profileHeadingWrap">
              <h2 className="cj-profileCardTitle">รายละเอียดข้อมูลส่วนตัว</h2>
            </div>
          </div>

          <div className="cj-profileForm">
            {fields.map((field) => (
              <div className="cj-profileRow" key={field.key}>
                <label className="cj-profileLabel" htmlFor={field.key}>
                  {field.label}
                </label>
                <input
                  id={field.key}
                  className="cj-profileInput cj-profileInput--readOnly"
                  type={field.type}
                  value={form[field.key]}
                  readOnly
                  autoComplete={field.autoComplete}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="cj-homeFooter" />
    </div>
  )
}

