import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PinkShell from '../components/PinkShell'

import { setStudentFullName, setStudentId } from '../lib/auth'
import { API_URL } from '../lib/apiConfig'

type LoginOk = { ok: true; student_id: string; full_name: string }
type LoginErr = { ok: false; message?: string; details?: string; code?: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const id = username.trim()
    if (!id) {
      setError('กรุณากรอกชื่อผู้ใช้')
      return
    }

    setLoading(true)
    let res: Response
    try {
      res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: id, password }),
      })
    } catch {
      setLoading(false)
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ เปิด back-end แล้วหรือยัง?')
      return
    }

    const json = (await res.json()) as LoginOk | LoginErr
    setLoading(false)

    if (!res.ok || !json.ok) {
      const err = json as LoginErr
      const extra =
        err.details && !import.meta.env.PROD ? ` (${err.details})` : ''
      setError(
        err.message ? `${err.message}${extra}` : 'เข้าสู่ระบบไม่สำเร็จ',
      )
      return
    }

    setStudentId(json.student_id)
    setStudentFullName(json.full_name)
    navigate('/')
  }

  return (
    <PinkShell title="Log-in" subtitle="เข้าสู่ระบบผ่านเซิร์ฟเวอร์">
      <form className="cj-form" onSubmit={onSubmit}>
        {error ? <p className="cj-formError">{error}</p> : null}

        <div className="cj-field">
          <label className="cj-label" htmlFor="username">
            ชื่อผู้ใช้
          </label>
          <input
            id="username"
            className="cj-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="รหัสนักศึกษา (student_id)"
            autoComplete="username"
            required
            disabled={loading}
          />
        </div>

        <div className="cj-field">
          <label className="cj-label" htmlFor="password">
            รหัสผ่าน
          </label>
          <input
            id="password"
            type="password"
            className="cj-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่าน"
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </div>

        <button className="cj-btn cj-btnPrimary" type="submit" disabled={loading}>
          {loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </PinkShell>
  )
}
