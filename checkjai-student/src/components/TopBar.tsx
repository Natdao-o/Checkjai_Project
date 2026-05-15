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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    <header className="cj-topbar flex flex-wrap md:flex-nowrap items-center justify-between px-4 md:px-8 py-3 relative z-50">
      <div className="cj-homeBrand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img 
          src={logoImage} 
          alt="Logo" 
          style={{ 
            height: '40px', 
            objectFit: 'contain'
          }} 
          className="md:h-[50px]"
        />
        <span className="cj-homeBrandText text-xl md:text-2xl">CheckJai</span>
      </div>

      {/* Hamburger Button - Mobile Only */}
      <button 
        className="md:hidden p-2 text-[#d44b7d] hover:bg-white/50 rounded-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Navigation - Desktop (Visible) & Mobile (Hidden/Toggle) */}
      <nav className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto mt-4 md:mt-0 gap-2 md:gap-0 cj-nav`}>

        <NavLink
          to="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => (isActive ? 'is-active w-full md:w-auto text-center' : 'w-full md:w-auto text-center')}
        >
          หน้าหลัก
        </NavLink>
        <NavLink
          to="/categories"
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => (isActive ? 'is-active w-full md:w-auto text-center' : 'w-full md:w-auto text-center')}
        >
          หมวดหมู่
        </NavLink>
        <NavLink
          to="/quiz"
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) =>
            isActive || window.location.pathname.startsWith('/quiz')
              ? 'is-active w-full md:w-auto text-center'
              : 'w-full md:w-auto text-center'
          }
        >
          แบบทดสอบ
        </NavLink>
        <NavLink
          to="/history"
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => (isActive ? 'is-active w-full md:w-auto text-center' : 'w-full md:w-auto text-center')}
        >
          ประวัติ
        </NavLink>
        <NavLink
          to="/profile"
          onClick={() => setIsMobileMenuOpen(false)}
          className={({ isActive }) => (isActive ? 'is-active w-full md:w-auto text-center' : 'w-full md:w-auto text-center')}
        >
          ข้อมูลส่วนตัว
        </NavLink>
      </nav>

      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-auto justify-center mt-4 md:mt-0`}>
        {displayName ? (
          <div className="cj-userMenuWrap w-full md:w-auto flex justify-center" ref={menuRef}>
            <button 
              type="button"
              className="cj-userNameBtn w-full md:w-auto"
              onClick={() => setShowLogout(!showLogout)}
            >
              {displayName} ▾
            </button>
            
            {showLogout && (
              <div className="cj-logoutMenu md:absolute w-full md:right-0 mt-2">
                <button type="button" className="cj-logoutBtn w-full text-center" onClick={handleLogout}>
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="cj-loginBtn w-full md:w-auto"
            onClick={() => {
              setIsMobileMenuOpen(false)
              navigate('/login')
            }}
          >
            เข้าสู่ระบบ
          </button>
        )}
      </div>
    </header>
  )
}
