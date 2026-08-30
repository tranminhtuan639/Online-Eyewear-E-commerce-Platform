import { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../api/nguoiDung'
import { setAuthToken, getAuthToken } from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // loading = true trong lúc kiểm tra xem còn đăng nhập hợp lệ không (F5 trang)
  const [loading, setLoading] = useState(true)

  // Khi app khởi động (hoặc F5 trang): nếu không có token lưu sẵn thì chắc chắn
  // chưa đăng nhập, khỏi cần gọi API làm gì. Nếu có token, hỏi lại server xem
  // token đó còn hợp lệ không (đề phòng hết hạn / bị đổi mật khẩu ở nơi khác).
  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }

    authApi.getMe()
      .then(res => setUser(res.data.data))
      .catch(() => {
        setAuthToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, matKhau) => {
    const res = await authApi.login(email, matKhau)
    const { token, ...userData } = res.data.data
    setAuthToken(token)
    setUser(userData)
    return userData
  }

  const register = async (email, matKhau, hoTen) => {
    const res = await authApi.register(email, matKhau, hoTen)
    const { token, ...userData } = res.data.data
    setAuthToken(token)
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      setAuthToken(null)
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