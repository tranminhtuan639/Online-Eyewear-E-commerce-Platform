import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    xacNhanMatKhau: '',
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.hoTen || !form.email || !form.matKhau) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }
    if (form.matKhau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (form.matKhau !== form.xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    setError('')
    try {
      await register(form.email.trim(), form.matKhau, form.hoTen.trim())
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
  <div 
    className="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: "url('background.jpg')" }}
  >
    {/* Card form đăng ký mờ đẹp mắt */}
    <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">👓</div>
        <h1 className="text-2xl font-bold text-gray-800">Tạo tài khoản</h1>
        <p className="text-gray-600 text-sm mt-1">Đăng ký để mua kính online</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Họ tên</label>
          <input
            name="hoTen"
            value={form.hoTen}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            className="w-full bg-white/40 border border-gray-300/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/80 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@gmail.com"
            className="w-full bg-white/40 border border-gray-300/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/80 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu</label>
          <input
            name="matKhau"
            type="password"
            value={form.matKhau}
            onChange={handleChange}
            placeholder="Ít nhất 6 ký tự"
            className="w-full bg-white/40 border border-gray-300/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/80 placeholder-gray-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Xác nhận mật khẩu</label>
          <input
            name="xacNhanMatKhau"
            type="password"
            value={form.xacNhanMatKhau}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu"
            className="w-full bg-white/40 border border-gray-300/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/80 placeholder-gray-500"
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
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Đã có tài khoản?{' '}
        <Link to="/dang-nhap" className="text-blue-600 hover:underline font-semibold">
          Đăng nhập
        </Link>
      </p>
    </div>
  </div>
)
}