import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth()

  // Đợi AuthContext hỏi xong server xem có session hợp lệ không, tránh nháy về trang login khi F5
  if (loading) return null

  if (!user) {
    return <Navigate to="/dang-nhap" replace />
  }

  if (user.vai_tro !== 'quanly') {
    return <Navigate to="/" replace />
  }

  return children
}
