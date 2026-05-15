import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { getStudentFullName, getStudentId, setStudentFullName, clearStudentAuth } from '../lib/auth'
import logoImage from '../assets/images/โลโก้Checkjai-removebg-preview.png'
import { API_URL } from '../lib/apiConfig'

export default function TopBar() {
  const navigate = useNavigate()
  const studentId = getStudentId()
  const [displayName, setDisplayName] = useState(getStudentFullName() || '')
  const [showLogout, setShowLogout] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!studentId) {
      setDisplayName('')
      return
    }
    
    fetch(`${API_URL}/api/auth/me?student_id=${studentId}`)
      .then(res => res.json())
      .then(json => {
        if (json.ok && json.full_name) {
          setDisplayName(json.full_name)
          setStudentFullName(json.full_name)
        }
      })
      .catch(() => {})
  }, [studentId])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLogout(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    clearStudentAuth()
    navigate('/login')
  }

  return (
    <header className="cj-topbar">
      <div className="cj-homeBrand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img 
          src={logoImage} 
          alt="Logo" 
          style={{ 
            height: '50px', 
            objectFit: 'contain'
          }} 
        />
        <span className="cj-homeBrandText">CheckJai</span>
      </div>

      <nav className="cj-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'is-active' : undefined)}
        >
          หน้าหลัก
        </NavLink>
        <NavLink
          to="/categories"
          className={({ isActive }) => (isActive ? 'is-active' : undefined)}
        >
          หมวดหมู่
        </NavLink>
        <NavLink
          to="/quiz"
          className={({ isActive }) =>
            isActive || window.location.pathname.startsWith('/quiz')
              ? 'is-active'
              : undefined
          }
        >
          แบบทดสอบ
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => (isActive ? 'is-active' : undefined)}
        >
          ประวัติ
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? 'is-active' : undefined)}
        >
          ข้อมูลส่วนตัว
        </NavLink>
      </nav>

      {displayName ? (
        <div className="cj-userMenuWrap" ref={menuRef}>
          <button 
            type="button"
            className="cj-userNameBtn"
            onClick={() => setShowLogout(!showLogout)}
          >
            {displayName} ▾
          </button>
          
          {showLogout && (
            <div className="cj-logoutMenu">
              <button type="button" className="cj-logoutBtn" onClick={handleLogout}>
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="cj-loginBtn"
          onClick={() => navigate('/login')}
        >
          เข้าสู่ระบบ
        </button>
      )}
    </header>
  )
}
