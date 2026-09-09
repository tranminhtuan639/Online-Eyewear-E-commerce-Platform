import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const redirectByRole = {
  quanly: '/admin',
  khachhang: '/',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, googleLogin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [matKhau, setMatKhau] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !matKhau) {
      setError('Vui lòng nhập email và mật khẩu')
      return
    }
    setLoading(true)
    setError('')
    try {
      const user = await login(email.trim(), matKhau)
      navigate(redirectByRole[user.vai_tro] ?? '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = useCallback(async (response) => {
    try {
      setLoading(true)
      setError('')

      const user = await googleLogin(response.credential)

      navigate(redirectByRole[user.vai_tro] ?? '/')
    } catch (err) {
      console.error('Google Login Error:', err)

      setError(
        err.response?.data?.message ||
        'Đăng nhập bằng Google thất bại'
      )
    } finally {
      setLoading(false)
    }
  }, [googleLogin, navigate])

  useEffect(() => {
    let interval

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id) {
        return false
      }

      const container = document.getElementById('google-login-button')

      if (!container) {
        return false
      }

      container.innerHTML = ''

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      })

      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: 330,
        text: 'signin_with',
        shape: 'rectangular',
      })

      return true
    }

    if (!renderGoogleButton()) {
      interval = setInterval(() => {
        if (renderGoogleButton()) {
          clearInterval(interval)
        }
      }, 100)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [handleGoogleLogin])

return (
  <div 
    className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: "url('background.jpg')" }}
  >
    {/* Form Card: dùng bg-white/70 hoặc bg-white/80 kết hợp backdrop-blur-md để làm hiệu ứng kính mờ */}
    <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">👓</div>
        <h1 className="text-2xl font-bold text-gray-800">Đăng nhập</h1>
        <p className="text-gray-600 text-sm mt-1">Chào mừng trở lại!</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            className="w-full bg-white/60 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu</label>
          <input
            type="password"
            value={matKhau}
            onChange={e => setMatKhau(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white/60 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-100/80 px-3 py-2 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60 shadow-md"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-300" />
        <span className="text-xs text-gray-500">HOẶC</span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>

      <div className="flex justify-center">
        <div id="google-login-button" />
      </div>

      <p className="text-center text-sm text-gray-600 mt-4">
        Chưa có tài khoản?{' '}
        <Link to="/dang-ky" className="text-blue-600 hover:underline font-semibold">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  </div>
)
}