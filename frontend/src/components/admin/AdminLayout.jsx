import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/san-pham', label: 'Sản phẩm', icon: '👓' },
  { to: '/admin/don-hang', label: 'Đơn hàng', icon: '📦' },
  { to: '/admin/khach-hang', label: 'Khách hàng', icon: '👤' },
  { to: '/admin/doanh-thu', label: 'Doanh thu', icon: '💰' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Đóng sidebar khi đổi route (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Khóa scroll body khi mở sidebar mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="admin-layout min-h-screen flex bg-gray-100">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar bg-gray-900 text-white flex flex-col fixed h-full z-40 ${
          sidebarOpen ? 'admin-sidebar--open' : ''
        }`}
      >
        <div className="px-5 py-5 border-b border-gray-700 flex items-center justify-between">
  <div>
    <img
      src="/logo.jpg"
      alt="BánKính"
      className="h-7 w-auto"
    />
    <p className="text-xs text-gray-400 mt-1">Quản trị viên</p>
  </div>
  <button
    type="button"
    className="admin-sidebar-close"
    onClick={() => setSidebarOpen(false)}
    aria-label="Đóng menu"
  >
    ✕
  </button>
</div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Đăng nhập với</p>
          <p className="text-sm font-medium text-white truncate">{user?.ho_ten}</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-xs text-gray-500 hover:text-red-400 transition"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="admin-main flex-1 flex flex-col min-h-screen min-w-0">
        <header className="admin-header bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu"
            >
              <span className="admin-menu-icon">☰</span>
            </button>
            <p className="text-sm text-gray-500 truncate">
              Xin chào,{' '}
              <span className="font-semibold text-gray-800">{user?.ho_ten}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="admin-back-btn"
          >
            ← Về trang khách hàng
          </button>
        </header>

        <main className="admin-content flex-1 p-4 sm:p-6 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
