import { Navigate, Route, Routes } from 'react-router-dom'

import AdminLoginPage from './pages/AdminLoginPage'
import AdminSearchPage from './pages/AdminSearchPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminStudentHistoryPage from './pages/AdminStudentHistoryPage'
import AdminStudentHistoryDetailPage from './pages/AdminStudentHistoryDetailPage'
import AdminSemesterSettingsPage from './pages/AdminSemesterSettingsPage'
import AdminLayout from './components/admin/AdminLayout'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/portal" element={<Navigate to="/admin/search" replace />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="search" replace />} />
        <Route path="search" element={<AdminSearchPage />} />
        <Route path="search/:studentId/history" element={<AdminStudentHistoryPage />} />
        <Route path="search/:studentId/history/:submissionId" element={<AdminStudentHistoryDetailPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="semester-settings" element={<AdminSemesterSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
