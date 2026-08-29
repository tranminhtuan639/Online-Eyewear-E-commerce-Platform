import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile, doiMatKhau, uploadAvatar } from '../api/nguoiDung'
import { getImageUrl } from '../api/axios'

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ ho_ten: '', email: '' })

  // ----- Avatar -----
  const fileInputRef = useRef(null)
  const [anhDaiDien, setAnhDaiDien] = useState(null) // đường dẫn tương đối đang lưu trên server
  const [previewUrl, setPreviewUrl] = useState(null) // xem trước ảnh mới chọn, trước khi upload xong
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  const [doiMkForm, setDoiMkForm] = useState({ mat_khau_cu: '', mat_khau_moi: '' })
  const [doiMkSaving, setDoiMkSaving] = useState(false)
  const [doiMkError, setDoiMkError] = useState('')
  const [doiMkSuccess, setDoiMkSuccess] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getProfile()
      .then(res => {
        const data = res.data.data
        setForm({ ho_ten: data.ho_ten || '', email: data.email || '' })
        setAnhDaiDien(data.anh_dai_dien || null)
      })
      .catch(() => setError('Không tải được thông tin tài khoản'))
      .finally(() => setLoading(false))
  }, [user])

  // Dọn URL blob xem trước khi component unmount hoặc chọn ảnh khác, tránh rò rỉ bộ nhớ.
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  const handleChonAnh = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('Chỉ nhận ảnh JPG, PNG hoặc WEBP')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Ảnh vượt quá 5MB')
      e.target.value = ''
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
    handleUploadAvatar(file)
  }

  const handleUploadAvatar = async (file) => {
    setAvatarUploading(true)
    setAvatarError('')
    try {
      const res = await uploadAvatar(file)
      const path = res.data.data.anh_dai_dien
      setAnhDaiDien(path)
      refreshUser({ anh_dai_dien: path })
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Tải ảnh lên thất bại, thử lại')
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.ho_ten.trim()) {
      setError('Vui lòng điền họ tên')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateProfile(form.ho_ten.trim())
      refreshUser({ ho_ten: form.ho_ten.trim() })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại, vui lòng thử lại')
    } finally {
      setSaving(false)
    }
  }

  const handleDoiMatKhau = async (e) => {
    e.preventDefault()
    if (!doiMkForm.mat_khau_cu || !doiMkForm.mat_khau_moi) {
      setDoiMkError('Vui lòng nhập đầy đủ mật khẩu cũ và mới')
      return
    }
    setDoiMkSaving(true)
    setDoiMkError('')
    setDoiMkSuccess(false)
    try {
      await doiMatKhau(doiMkForm.mat_khau_cu, doiMkForm.mat_khau_moi)
      setDoiMkSuccess(true)
      setDoiMkForm({ mat_khau_cu: '', mat_khau_moi: '' })
    } catch (err) {
      setDoiMkError(err.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setDoiMkSaving(false)
    }
  }

  if (authLoading) return null

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-gray-700">Chưa đăng nhập</h2>
        <p className="text-gray-400 mt-2 mb-6">Vui lòng đăng nhập để xem thông tin tài khoản</p>
        <button
          onClick={() => navigate('/dang-nhap')}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition"
        >
          Đăng nhập
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800">👤 Thông tin tài khoản</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="text-sm text-gray-500">Vai trò:</span>
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {user.vai_tro === 'quanly' ? '🔧 Quản lý' : '🛍️ Khách hàng'}
              </span>
            </div>

            {/* Ảnh đại diện */}
            <div className="mb-5 flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                {previewUrl || anhDaiDien ? (
                  <img
                    src={previewUrl || getImageUrl(anhDaiDien)}
                    alt="Ảnh đại diện"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-300">👤</span>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleChonAnh}
                  className="hidden"
                  id="avatar-input"
                />
                <label
                  htmlFor="avatar-input"
                  className={`text-sm font-medium border border-gray-200 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-50 transition inline-block ${avatarUploading ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {avatarUploading ? 'Đang tải lên...' : 'Đổi ảnh đại diện'}
                </label>
                <p className="text-xs text-gray-400 mt-1.5">JPG, PNG hoặc WEBP, tối đa 5MB</p>
                {avatarError && <p className="text-xs text-red-500 mt-1">{avatarError}</p>}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block font-medium">Họ tên</label>
                <input
                  name="ho_ten"
                  value={form.ho_ten}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block font-medium">Email</label>
                <input
                  value={form.email}
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Không thể đổi email sau khi đăng ký</p>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
              {success && (
                <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                  ✓ Cập nhật thông tin thành công!
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">🔑 Đổi mật khẩu</h2>
            <form onSubmit={handleDoiMatKhau} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block font-medium">Mật khẩu cũ</label>
                <input
                  type="password"
                  value={doiMkForm.mat_khau_cu}
                  onChange={e => setDoiMkForm(p => ({ ...p, mat_khau_cu: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block font-medium">Mật khẩu mới</label>
                <input
                  type="password"
                  value={doiMkForm.mat_khau_moi}
                  onChange={e => setDoiMkForm(p => ({ ...p, mat_khau_moi: e.target.value }))}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {doiMkError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{doiMkError}</p>}
              {doiMkSuccess && (
                <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-xl">✓ Đổi mật khẩu thành công!</p>
              )}

              <button
                type="submit"
                disabled={doiMkSaving}
                className="w-full bg-gray-800 text-white py-2.5 rounded-xl font-medium hover:bg-gray-700 transition disabled:opacity-60"
              >
                {doiMkSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
