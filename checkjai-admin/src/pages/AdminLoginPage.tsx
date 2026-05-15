import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CHECKJAI_TEACHER_STORAGE_KEY,
  CHECKJAI_TEACHER_TOKEN_KEY,
} from '../lib/teacherSession'
import logoImage from '../assets/images/โลโก้Checkjai-removebg-preview.png'
import { API_URL } from '../lib/apiConfig'

type Ok = { ok: true; username: string; token: string }
type Err = { ok: false; message?: string; details?: string; code?: string }

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(CHECKJAI_TEACHER_TOKEN_KEY)) {
      navigate('/admin/search', { replace: true })
    }
  }, [navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const u = username.trim()
    if (!u) {
      setError('กรุณากรอก Username')
      return
    }

    setLoading(true)
    let res: Response
    try {
      res = await fetch(`${API_URL}/api/auth/teacher/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password }),
      })
    } catch {
      setLoading(false)
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ เปิด back-end แล้วหรือยัง?')
      return
    }

    const json = (await res.json()) as Ok | Err
    setLoading(false)

    if (!res.ok || !json.ok) {
      const err = json as Err
      const extra =
        err.details && !import.meta.env.PROD ? ` (${err.details})` : ''
      let msg = err.message ?? 'เข้าสู่ระบบไม่สำเร็จ'
      if (res.status === 401) {
        msg +=
          ' — ถ้าเพิ่งตั้งระบบ: ใน Supabase ต้องมีแถวในตาราง `teachers` แล้ว (รัน `supabase/teachers_login.sql` หรือ `teachers_insert_dev_account.sql`) แล้วลองใหม่ด้วย username/password ที่สร้างไว้'
      }
      if (res.status === 500 && !err.details) {
        msg +=
          ' — ตรวจสอบค่า VITE_/SUPABASE_ ใน .env และว่า Postgres มีฟังก์ชัน `login_teacher`'
      }
      setError(`${msg}${extra}`)
      return
    }

    sessionStorage.setItem(CHECKJAI_TEACHER_STORAGE_KEY, json.username)
    sessionStorage.setItem(CHECKJAI_TEACHER_TOKEN_KEY, json.token)
    navigate('/admin/search')
  }

  return (
    <div className="aj-adminLoginPage">
      <div className="aj-adminCard">
        <header className="aj-adminCardHeader">
          <div className="aj-adminBrandPill" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img
              src={logoImage}
              alt="Logo"
              style={{
                height: '50px',
                objectFit: 'contain',
                marginRight: '8px'
              }}
            />
            <span className="aj-adminBrandName">CheckJai</span>
          </div>
        </header>

        <h1 className="aj-adminTitle">Log-in</h1>
        <p className="aj-adminPolicyNote">
          บัญชีสำหรับอาจารย์สร้างโดยผู้ดูแลระบบในฐานข้อมูลเท่านั้น
          หากต้องการใช้งาน กรุณาติดต่อผู้ดูแล
        </p>

        <form className="aj-adminForm" onSubmit={onSubmit} noValidate>
          {error ? <p className="aj-adminError">{error}</p> : null}

          <div className="aj-adminField">
            <label className="aj-adminLabel" htmlFor="aj-username">
              Username :
            </label>
            <div className="aj-inputWrap">
              <span className="aj-inputIconLeft" aria-hidden="true" title="User">
                👤
              </span>
              <input
                id="aj-username"
                className="aj-inputPill"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
                placeholder=" "
                aria-label="Username"
              />
            </div>
          </div>

          <div className="aj-adminField">
            <label className="aj-adminLabel" htmlFor="aj-password">
              Password :
            </label>
            <div className="aj-inputWrap">
              <span className="aj-inputIconLeft" aria-hidden="true" title="Lock">
                🔒
              </span>
              <input
                id="aj-password"
                type={showPassword ? 'text' : 'password'}
                className="aj-inputPill aj-inputPill--hasRight"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                placeholder=" "
                aria-label="Password"
              />
              <button
                type="button"
                className="aj-inputTogglePw"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                disabled={loading}
              >
                {showPassword ? (
                  <svg
                    className="aj-heroicon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="aj-heroicon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="aj-adminCta">
            <button
              className="aj-btnLogin"
              type="submit"
              disabled={loading}
            >
              {loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>

        <p className="aj-adminFooterNote">
          หากพบปัญหากรุณาติดต่อเจ้าหน้าที่ที่ดูแลระบบหรือติดต่อที่เบอร์ xxx-xxx-xxxx
        </p>
      </div>
    </div>
  )
}
