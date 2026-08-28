import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { cartItems } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const tongSoLuong = cartItems.reduce((sum, item) => sum + item.soLuong, 0)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
          👓 BánKính.vn
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition">Sản phẩm</Link>
          <Link to="/don-hang" className="hover:text-blue-600 transition">Đơn hàng</Link>

          <button
            onClick={() => navigate('/gio-hang')}
            className="relative flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition"
          >
            🛒 Giỏ hàng
            {tongSoLuong > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {tongSoLuong}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {user.vai_tro === 'quanly' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-full hover:bg-gray-700 transition"
                >
                  Quản lý hệ thống
                </button>
              )}

              {user.vai_tro === 'khachhang' && (
                <button
                  onClick={() => navigate('/tai-khoan')}
                  className="text-sm text-gray-700 hover:text-blue-600 transition font-semibold"
                >
                  👤 {user.ho_ten.split(' ').pop()}
                </button>
              )}

              {user.vai_tro !== 'khachhang' && (
                <span className="text-gray-700 text-sm">
                  Xin chào, <span className="font-semibold text-blue-600">{user.ho_ten.split(' ').pop()}</span>
                </span>
              )}

              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-500 transition border border-gray-200 px-3 py-1.5 rounded-full"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/dang-nhap"
                className="text-gray-600 hover:text-blue-600 transition border border-gray-200 px-3 py-1.5 rounded-full text-sm"
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-ky"
                className="bg-gray-800 text-white px-3 py-1.5 rounded-full hover:bg-gray-700 transition text-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
