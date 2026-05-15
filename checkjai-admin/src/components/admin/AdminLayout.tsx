import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  adminFetch,
  CHECKJAI_TEACHER_STORAGE_KEY,
  clearTeacherSession,
} from '../../lib/teacherSession'

export default function AdminLayout() {
  const navigate = useNavigate()
  const displayName = sessionStorage.getItem(CHECKJAI_TEACHER_STORAGE_KEY) ?? ''

  async function logout() {
    try {
      await adminFetch('/api/auth/teacher/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    clearTeacherSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="aj-dash">
      <aside className="aj-dashSidebar" aria-label="เมนูผู้ดูแล">
        <nav className="aj-dashNav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `aj-dashNavLink ${isActive ? 'is-active' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/search"
            className={({ isActive }) =>
              `aj-dashNavLink ${isActive ? 'is-active' : ''}`
            }
          >
            Search / Directory
          </NavLink>
          <NavLink
            to="/admin/semester-settings"
            className={({ isActive }) =>
              `aj-dashNavLink ${isActive ? 'is-active' : ''}`
            }
          >
            Semester Settings
          </NavLink>
        </nav>
        <div className="aj-dashSidebarFoot">
          <p className="aj-dashUser">{displayName}</p>
          <button type="button" className="aj-dashLogout" onClick={logout}>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <div className="aj-dashMain">
        <Outlet />
      </div>
    </div>
  )
}
