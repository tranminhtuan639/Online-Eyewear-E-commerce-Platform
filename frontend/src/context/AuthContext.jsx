import { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../api/nguoiDung'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // loading = true trong lúc kiểm tra xem trình duyệt còn session hợp lệ không (F5 trang)
  const [loading, setLoading] = useState(true)

  // Khi app khởi động (hoặc F5 trang), hỏi lại server "tôi có đang đăng nhập không?"
  // thay vì tin vào dữ liệu cũ lưu trong localStorage (dữ liệu đó không hề được server xác nhận).
  useEffect(() => {
    authApi.getMe()
      .then(res => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, matKhau) => {
    const res = await authApi.login(email, matKhau)
    setUser(res.data.data)
    return res.data.data
  }

  const register = async (email, matKhau, hoTen) => {
    const res = await authApi.register(email, matKhau, hoTen)
    setUser(res.data.data)
    return res.data.data
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }

  // Dùng khi tự sửa thông tin cá nhân xong, cập nhật lại user trong context cho khớp
  const refreshUser = (partial) => {
    setUser(prev => (prev ? { ...prev, ...partial } : prev))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
